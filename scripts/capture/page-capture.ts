/**
 * 페이지 스크린샷 캡처 로직
 */

import { Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { CaptureConfig, loadConfig } from '../../config/capture.config.js';
import { CaptureResult, ScreenConfig, StateConfig } from '../../config/types.js';
import { StateManager } from './state-manager.js';

export interface CaptureOptions {
  outputDir?: string;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
  fullPage?: boolean;
  locale?: 'ko-KR' | 'en-US';
}

export class PageCapture {
  private config: CaptureConfig;
  private stateManager: StateManager;

  constructor(
    private page: Page,
    options?: Partial<CaptureConfig>
  ) {
    this.config = { ...loadConfig(), ...options };
    this.stateManager = new StateManager(page);
  }

  /**
   * 단일 상태 스크린샷 캡처
   */
  async captureState(
    screen: ScreenConfig,
    state: StateConfig,
    options?: CaptureOptions
  ): Promise<CaptureResult> {
    const startTime = Date.now();
    const locale = options?.locale || this.config.locale;
    const outputDir = path.join(
      options?.outputDir || this.config.outputDir,
      locale
    );

    // 출력 디렉토리 생성
    this.ensureDirectory(outputDir);

    const filename = this.generateFilename(screen.id, state.stateId, options?.format || this.config.format);
    const screenshotPath = path.join(outputDir, filename);

    try {
      // 상태 설정 적용
      await this.stateManager.applyStateConfig(state);

      // 애니메이션 완료 대기
      await this.stateManager.waitForAnimations();

      // 네트워크 안정화 대기
      await this.stateManager.waitForNetworkIdle(2000);

      // 스크린샷 캡처
      await this.page.screenshot({
        path: screenshotPath,
        type: options?.format || this.config.format,
        quality: options?.format === 'jpeg' ? (options?.quality || 90) : undefined,
        fullPage: options?.fullPage ?? this.config.fullPage,
      });

      const duration = Date.now() - startTime;
      console.log(`[PageCapture] Captured ${screen.id}/${state.stateId} in ${duration}ms`);

      return {
        screenId: screen.id,
        stateId: state.stateId,
        screenshotPath: path.relative(process.cwd(), screenshotPath),
        capturedAt: new Date().toISOString(),
        viewport: {
          width: this.config.viewport.width,
          height: this.config.viewport.height,
        },
        locale,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[PageCapture] Failed to capture ${screen.id}/${state.stateId}: ${errorMessage}`);

      return {
        screenId: screen.id,
        stateId: state.stateId,
        screenshotPath: '',
        capturedAt: new Date().toISOString(),
        viewport: {
          width: this.config.viewport.width,
          height: this.config.viewport.height,
        },
        locale,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 화면의 모든 상태 캡처
   */
  async captureScreen(
    screen: ScreenConfig,
    baseUrl: string,
    auth?: { email: string; password: string },
    options?: CaptureOptions
  ): Promise<CaptureResult[]> {
    const results: CaptureResult[] = [];

    // 페이지 이동
    await this.page.goto(`${baseUrl}${screen.route}`, {
      waitUntil: this.config.waitStrategy,
      timeout: this.config.timeout,
    });

    // 인증이 필요한 경우 로그인 수행
    if (screen.requiresAuth && auth) {
      const loginSuccess = await this.stateManager.performLogin(auth.email, auth.password);
      if (!loginSuccess) {
        console.error(`[PageCapture] Authentication failed for ${screen.id}`);
        return screen.states.map((state) => ({
          screenId: screen.id,
          stateId: state.stateId,
          screenshotPath: '',
          capturedAt: new Date().toISOString(),
          viewport: {
            width: this.config.viewport.width,
            height: this.config.viewport.height,
          },
          locale: options?.locale || this.config.locale,
          success: false,
          error: 'Authentication failed',
        }));
      }
    }

    // 각 상태별 캡처
    for (const state of screen.states) {
      // 상태 간 페이지 새로고침 (상태 격리)
      if (screen.states.indexOf(state) > 0) {
        await this.page.reload({ waitUntil: this.config.waitStrategy });

        // 재인증
        if (screen.requiresAuth && auth) {
          await this.stateManager.performLogin(auth.email, auth.password);
        }
      }

      const result = await this.captureState(screen, state, options);
      results.push(result);
    }

    return results;
  }

  /**
   * 여러 화면 일괄 캡처
   */
  async captureMultipleScreens(
    screens: ScreenConfig[],
    baseUrl: string,
    auth?: { email: string; password: string },
    options?: CaptureOptions
  ): Promise<CaptureResult[]> {
    const allResults: CaptureResult[] = [];

    for (const screen of screens) {
      const results = await this.captureScreen(screen, baseUrl, auth, options);
      allResults.push(...results);
    }

    return allResults;
  }

  /**
   * 특정 요소만 캡처
   */
  async captureElement(
    selector: string,
    screen: ScreenConfig,
    state: StateConfig,
    options?: CaptureOptions
  ): Promise<CaptureResult> {
    const locale = options?.locale || this.config.locale;
    const outputDir = path.join(
      options?.outputDir || this.config.outputDir,
      locale,
      'elements'
    );

    this.ensureDirectory(outputDir);

    const filename = this.generateFilename(
      screen.id,
      `${state.stateId}_element`,
      options?.format || this.config.format
    );
    const screenshotPath = path.join(outputDir, filename);

    try {
      await this.stateManager.applyStateConfig(state);
      await this.stateManager.waitForSelector(selector);

      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }

      await element.screenshot({
        path: screenshotPath,
        type: options?.format || this.config.format,
      });

      return {
        screenId: screen.id,
        stateId: state.stateId,
        screenshotPath: path.relative(process.cwd(), screenshotPath),
        capturedAt: new Date().toISOString(),
        viewport: {
          width: this.config.viewport.width,
          height: this.config.viewport.height,
        },
        locale,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        screenId: screen.id,
        stateId: state.stateId,
        screenshotPath: '',
        capturedAt: new Date().toISOString(),
        viewport: {
          width: this.config.viewport.width,
          height: this.config.viewport.height,
        },
        locale,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * PDF로 페이지 내보내기
   */
  async exportToPdf(
    screen: ScreenConfig,
    outputDir?: string
  ): Promise<string> {
    const pdfDir = path.join(outputDir || this.config.outputDir, 'pdf');
    this.ensureDirectory(pdfDir);

    const filename = `${screen.id}.pdf`;
    const pdfPath = path.join(pdfDir, filename);

    await this.page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });

    return path.relative(process.cwd(), pdfPath);
  }

  /**
   * 파일명 생성
   */
  private generateFilename(
    screenId: string,
    stateId: string,
    format: string
  ): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `${screenId}_${stateId}_${timestamp}.${format}`;
  }

  /**
   * 디렉토리 생성 (없으면)
   */
  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
