/**
 * UI 상태 관리 및 주입
 */

import { Page } from 'puppeteer';
import { Interaction, StateConfig } from '../../config/types.js';

// Helper function for waiting
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StateManager {
  constructor(private page: Page) {}

  /**
   * React 앱에 상태 주입
   * useCaptureStateInjection 훅과 연동하여 React 상태를 외부에서 제어
   */
  async injectState(state: Record<string, unknown>): Promise<void> {
    await this.page.evaluate((stateData) => {
      // localStorage에 상태 저장 (대시보드 레이아웃 등 영속적 상태용)
      if (stateData.dashboardLayout) {
        localStorage.setItem('my_dashboard_layout', JSON.stringify(stateData.dashboardLayout));
      }
      if (stateData.dashboardWidgets) {
        localStorage.setItem('my_dashboard_widgets', JSON.stringify(stateData.dashboardWidgets));
      }

      // window 객체에 상태 저장 (React 훅에서 초기 상태 확인용)
      (window as unknown as Record<string, unknown>).__KONA_INJECTED_STATE__ = stateData;

      // 상태 주입 이벤트 발생 (useCaptureStateInjection 훅이 리스닝)
      window.dispatchEvent(new CustomEvent('kona-state-injected', { detail: stateData }));

      console.log('[StateManager] 상태 주입 완료:', stateData);
    }, state);

    // React 상태 업데이트 및 리렌더링 대기 (500ms로 증가)
    await delay(500);
  }

  /**
   * 특정 선택자가 나타날 때까지 대기
   */
  async waitForSelector(selector: string, timeout = 10000): Promise<void> {
    await this.page.waitForSelector(selector, {
      visible: true,
      timeout,
    });
  }

  /**
   * 네트워크가 안정될 때까지 대기
   */
  async waitForNetworkIdle(timeout = 5000): Promise<void> {
    try {
      await this.page.waitForNetworkIdle({ timeout });
    } catch {
      // 타임아웃 시 무시 (일부 요청이 계속될 수 있음)
      console.log('[StateManager] Network idle timeout reached');
    }
  }

  /**
   * 상호작용 시퀀스 실행
   */
  async executeInteractions(interactions: Interaction[]): Promise<void> {
    for (const interaction of interactions) {
      await this.executeInteraction(interaction);
      // 상호작용 간 짧은 대기
      await delay(interaction.duration || 100);
    }
  }

  /**
   * 단일 상호작용 실행
   */
  private async executeInteraction(interaction: Interaction): Promise<void> {
    switch (interaction.action) {
      case 'click':
        if (interaction.selector) {
          await this.page.waitForSelector(interaction.selector, { visible: true });
          await this.page.click(interaction.selector);
          await delay(100);
        }
        break;

      case 'type':
        if (interaction.selector && interaction.value !== undefined) {
          await this.page.waitForSelector(interaction.selector, { visible: true });
          // 기존 값 지우기
          await this.page.click(interaction.selector, { clickCount: 3 });
          await this.page.type(interaction.selector, interaction.value);
        }
        break;

      case 'hover':
        if (interaction.selector) {
          await this.page.waitForSelector(interaction.selector, { visible: true });
          await this.page.hover(interaction.selector);
        }
        break;

      case 'wait':
        await delay(interaction.duration || 1000);
        break;

      case 'scroll':
        if (interaction.x !== undefined && interaction.y !== undefined) {
          await this.page.evaluate((x, y) => {
            window.scrollTo(x, y);
          }, interaction.x, interaction.y);
        } else if (interaction.selector) {
          await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, interaction.selector);
        }
        break;

      case 'select':
        if (interaction.selector && interaction.value) {
          await this.page.select(interaction.selector, interaction.value);
        }
        break;

      case 'clear':
        if (interaction.selector) {
          await this.page.waitForSelector(interaction.selector, { visible: true });
          // React controlled input을 위한 값 초기화
          // 1. 필드에 포커스
          await this.page.focus(interaction.selector);
          // 2. 전체 선택 (Cmd+A on Mac, Ctrl+A on others)
          const isMac = process.platform === 'darwin';
          await this.page.keyboard.down(isMac ? 'Meta' : 'Control');
          await this.page.keyboard.press('a');
          await this.page.keyboard.up(isMac ? 'Meta' : 'Control');
          // 3. 삭제
          await this.page.keyboard.press('Backspace');
          // 4. Tab으로 blur (다음 필드로 이동)
          await this.page.keyboard.press('Tab');
          await delay(50);
        }
        break;

      default:
        console.warn(`[StateManager] Unknown interaction action: ${interaction.action}`);
    }
  }

  /**
   * 상태 설정 적용 (StateConfig 기반)
   * 순서: 상태주입 → 대기 → 상호작용 → 후속대기 → 지연
   */
  async applyStateConfig(stateConfig: StateConfig): Promise<void> {
    // 1. 상태 주입 먼저 (viewMode 등 React 상태 변경을 위해)
    // 이렇게 해야 waitFor에서 기다리는 요소가 렌더링됨
    if (stateConfig.injectState) {
      await this.injectState(stateConfig.injectState);
      // React 리렌더링 완료 대기
      await delay(500);
    }

    // 2. 대기 조건 (상태 주입으로 인해 요소가 나타난 후)
    if (stateConfig.waitFor) {
      await this.waitForSelector(stateConfig.waitFor);
      // React 이벤트 핸들러 바인딩을 위한 안정화 대기
      await delay(300);
    }

    // 3. 상호작용 실행 (있는 경우)
    if (stateConfig.interactions && stateConfig.interactions.length > 0) {
      await this.executeInteractions(stateConfig.interactions);
    }

    // 4. 상호작용 후 대기 조건 (interactions 후 요소 대기)
    if (stateConfig.waitForAfter) {
      await this.waitForSelector(stateConfig.waitForAfter);
    }

    // 5. 추가 지연 (있는 경우)
    if (stateConfig.delay) {
      await delay(stateConfig.delay);
    }
  }

  /**
   * 로그인 수행
   */
  async performLogin(email: string, password: string): Promise<boolean> {
    try {
      // 이메일 입력
      const emailSelector = '[data-testid="email-input"], input[type="email"], input[name="email"]';
      await this.page.waitForSelector(emailSelector, { visible: true, timeout: 5000 });
      await this.page.type(emailSelector, email);

      // 비밀번호 입력
      const passwordSelector = '[data-testid="password-input"], input[type="password"], input[name="password"]';
      await this.page.waitForSelector(passwordSelector, { visible: true });
      await this.page.type(passwordSelector, password);

      // 로그인 버튼 클릭
      const loginButtonSelector = '[data-testid="login-button"], button[type="submit"]';
      await this.page.click(loginButtonSelector);

      // 로그인 완료 대기
      await this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {
        // 페이지 리로드 없이 상태만 변경되는 경우
      });

      // 대시보드가 나타날 때까지 대기
      await delay(1000);

      return true;
    } catch (error) {
      console.error('[StateManager] Login failed:', error);
      return false;
    }
  }

  /**
   * 현재 뷰 모드 변경 (AppViewMode)
   */
  async changeViewMode(viewMode: string): Promise<void> {
    await this.page.evaluate((mode) => {
      (window as unknown as Record<string, unknown>).__KONA_VIEW_MODE__ = mode;
      window.dispatchEvent(new CustomEvent('kona-view-mode-change', { detail: { viewMode: mode } }));
    }, viewMode);

    await delay(500);
  }

  /**
   * 애니메이션 완료 대기 (무한 애니메이션 제외)
   */
  async waitForAnimations(timeout = 3000): Promise<void> {
    try {
      await Promise.race([
        this.page.evaluate(() => {
          return new Promise<void>((resolve) => {
            const animations = document.getAnimations();
            // 무한 반복 애니메이션 필터링 (iterations === Infinity)
            const finiteAnimations = animations.filter((anim) => {
              const effect = anim.effect as KeyframeEffect;
              const timing = effect?.getComputedTiming?.();
              return timing?.iterations !== Infinity;
            });

            if (finiteAnimations.length === 0) {
              resolve();
              return;
            }

            Promise.all(finiteAnimations.map((animation) => animation.finished))
              .then(() => resolve())
              .catch(() => resolve());
          });
        }),
        // 타임아웃 폴백
        new Promise<void>((resolve) => setTimeout(resolve, timeout)),
      ]);
    } catch {
      // 에러 발생 시 무시하고 진행
    }
  }
}
