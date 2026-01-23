/**
 * 캡처 엔진 - 기존 capture 모듈의 통합 인터페이스
 * 스크린샷 캡처 기능을 워크플로우에서 쉽게 사용할 수 있도록 래핑
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { CaptureResult, ScreenConfig, StateConfig, CaptureManifest } from '../../config/types.js';

export interface CaptureEngineConfig {
  baseUrl: string;
  outputDir: string;
  locale: 'ko-KR' | 'en-US';
  viewport: { width: number; height: number };
  timeout: number;
  headless: boolean;
  format: 'png' | 'jpeg' | 'webp';
  fullPage: boolean;
}

export interface CaptureSession {
  browser: Browser;
  page: Page;
  startedAt: Date;
}

const DEFAULT_CONFIG: CaptureEngineConfig = {
  baseUrl: 'http://localhost:3000',
  outputDir: 'outputs/screenshots',
  locale: 'ko-KR',
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,
  headless: true,
  format: 'png',
  fullPage: false,
};

export class CaptureEngine {
  private config: CaptureEngineConfig;
  private session: CaptureSession | null = null;
  private results: CaptureResult[] = [];

  constructor(config: Partial<CaptureEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 캡처 세션 시작
   */
  async startSession(): Promise<void> {
    if (this.session) {
      console.log('[CaptureEngine] Session already started');
      return;
    }

    console.log('[CaptureEngine] Starting capture session...');

    const browser = await puppeteer.launch({
      headless: this.config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        `--window-size=${this.config.viewport.width},${this.config.viewport.height}`,
      ],
    });

    const page = await browser.newPage();
    await page.setViewport(this.config.viewport);

    // 한글 폰트 설정
    if (this.config.locale === 'ko-KR') {
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'language', { value: 'ko-KR' });
        Object.defineProperty(navigator, 'languages', { value: ['ko-KR', 'ko'] });
      });
    }

    this.session = {
      browser,
      page,
      startedAt: new Date(),
    };

    this.results = [];
    console.log('[CaptureEngine] Session started');
  }

  /**
   * 캡처 세션 종료
   */
  async endSession(): Promise<CaptureManifest> {
    if (!this.session) {
      throw new Error('No active session');
    }

    console.log('[CaptureEngine] Ending capture session...');

    await this.session.browser.close();

    const manifest = this.generateManifest();

    this.session = null;
    console.log('[CaptureEngine] Session ended');

    return manifest;
  }

  /**
   * 단일 화면 캡처
   */
  async captureScreen(
    screen: ScreenConfig,
    auth?: { email: string; password: string }
  ): Promise<CaptureResult[]> {
    if (!this.session) {
      await this.startSession();
    }

    const { page } = this.session!;
    const screenResults: CaptureResult[] = [];

    console.log(`[CaptureEngine] Capturing screen: ${screen.id} (${screen.name})`);

    try {
      // 페이지 이동
      const url = `${this.config.baseUrl}${screen.route}`;
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: this.config.timeout,
      });

      // 인증 처리 (필요시)
      if (screen.requiresAuth && auth) {
        await this.performAuth(page, auth);
      }

      // 각 상태별 캡처
      for (const state of screen.states) {
        const result = await this.captureState(page, screen, state);
        screenResults.push(result);
        this.results.push(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[CaptureEngine] Error capturing ${screen.id}: ${errorMessage}`);

      // 에러 발생 시 모든 상태에 대해 실패 결과 생성
      for (const state of screen.states) {
        const failResult: CaptureResult = {
          screenId: screen.id,
          stateId: state.stateId,
          screenshotPath: '',
          capturedAt: new Date().toISOString(),
          viewport: this.config.viewport,
          locale: this.config.locale,
          success: false,
          error: errorMessage,
        };
        screenResults.push(failResult);
        this.results.push(failResult);
      }
    }

    return screenResults;
  }

  /**
   * 여러 화면 일괄 캡처
   */
  async captureScreens(
    screens: ScreenConfig[],
    auth?: { email: string; password: string }
  ): Promise<CaptureResult[]> {
    const allResults: CaptureResult[] = [];

    for (const screen of screens) {
      const results = await this.captureScreen(screen, auth);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * 특정 상태 캡처
   */
  private async captureState(
    page: Page,
    screen: ScreenConfig,
    state: StateConfig
  ): Promise<CaptureResult> {
    const outputDir = path.join(this.config.outputDir, this.config.locale);
    this.ensureDir(outputDir);

    const filename = `${screen.id}_${state.stateId}_${this.getDateString()}.${this.config.format}`;
    const screenshotPath = path.join(outputDir, filename);

    try {
      // 상태 설정 대기
      if (state.waitFor) {
        await page.waitForSelector(state.waitFor, { timeout: this.config.timeout });
      }

      // 딜레이 적용
      if (state.delay) {
        await this.sleep(state.delay);
      }

      // 인터랙션 실행
      if (state.interactions) {
        await this.executeInteractions(page, state.interactions);
      }

      // 인터랙션 후 대기
      if (state.waitForAfter) {
        await page.waitForSelector(state.waitForAfter, { timeout: this.config.timeout });
      }

      // 스크린샷 캡처
      await page.screenshot({
        path: screenshotPath,
        type: this.config.format,
        fullPage: this.config.fullPage,
      });

      console.log(`[CaptureEngine] Captured: ${screen.id}/${state.stateId}`);

      return {
        screenId: screen.id,
        stateId: state.stateId,
        screenshotPath: path.relative(process.cwd(), screenshotPath),
        capturedAt: new Date().toISOString(),
        viewport: this.config.viewport,
        locale: this.config.locale,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[CaptureEngine] Failed: ${screen.id}/${state.stateId} - ${errorMessage}`);

      return {
        screenId: screen.id,
        stateId: state.stateId,
        screenshotPath: '',
        capturedAt: new Date().toISOString(),
        viewport: this.config.viewport,
        locale: this.config.locale,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 인터랙션 실행
   */
  private async executeInteractions(
    page: Page,
    interactions: StateConfig['interactions']
  ): Promise<void> {
    if (!interactions) return;

    for (const interaction of interactions) {
      switch (interaction.action) {
        case 'click':
          if (interaction.selector) {
            await page.click(interaction.selector);
          }
          break;
        case 'type':
          if (interaction.selector && interaction.value) {
            await page.type(interaction.selector, interaction.value);
          }
          break;
        case 'hover':
          if (interaction.selector) {
            await page.hover(interaction.selector);
          }
          break;
        case 'wait':
          if (interaction.duration) {
            await this.sleep(interaction.duration);
          }
          break;
        case 'scroll':
          if (interaction.y !== undefined) {
            await page.evaluate((y) => window.scrollTo(0, y), interaction.y);
          }
          break;
        case 'select':
          if (interaction.selector && interaction.value) {
            await page.select(interaction.selector, interaction.value);
          }
          break;
        case 'clear':
          if (interaction.selector) {
            await page.$eval(interaction.selector, (el) => {
              if (el instanceof HTMLInputElement) {
                el.value = '';
              }
            });
          }
          break;
      }

      // 인터랙션 간 짧은 대기
      await this.sleep(100);
    }
  }

  /**
   * 인증 수행
   */
  private async performAuth(
    page: Page,
    auth: { email: string; password: string }
  ): Promise<boolean> {
    try {
      // 이메일 입력
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
      await page.type('input[type="email"], input[name="email"]', auth.email);

      // 비밀번호 입력
      await page.type('input[type="password"], input[name="password"]', auth.password);

      // 로그인 버튼 클릭
      await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');

      // 로그인 완료 대기
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      return true;
    } catch (error) {
      console.error('[CaptureEngine] Authentication failed:', error);
      return false;
    }
  }

  /**
   * 매니페스트 생성
   */
  private generateManifest(): CaptureManifest {
    const successCount = this.results.filter(r => r.success).length;
    const screenIds = [...new Set(this.results.map(r => r.screenId))];

    return {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      locale: this.config.locale,
      totalScreens: screenIds.length,
      totalStates: this.results.length,
      results: this.results,
    };
  }

  /**
   * 매니페스트 저장
   */
  async saveManifest(manifest: CaptureManifest, outputPath?: string): Promise<string> {
    const manifestPath = outputPath || path.join(this.config.outputDir, 'manifest.json');
    this.ensureDir(path.dirname(manifestPath));

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`[CaptureEngine] Manifest saved: ${manifestPath}`);

    return manifestPath;
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<CaptureEngineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 현재 결과 조회
   */
  getResults(): CaptureResult[] {
    return [...this.results];
  }

  /**
   * 세션 활성 여부
   */
  isSessionActive(): boolean {
    return this.session !== null;
  }

  /**
   * 디렉터리 생성
   */
  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 날짜 문자열 생성
   */
  private getDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Sleep 유틸리티
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 싱글톤 인스턴스
 */
let captureInstance: CaptureEngine | null = null;

export function getCaptureEngine(config?: Partial<CaptureEngineConfig>): CaptureEngine {
  if (!captureInstance) {
    captureInstance = new CaptureEngine(config);
  }
  return captureInstance;
}

export function resetCaptureEngine(): void {
  if (captureInstance && captureInstance.isSessionActive()) {
    captureInstance.endSession();
  }
  captureInstance = null;
}
