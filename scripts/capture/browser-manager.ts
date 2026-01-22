/**
 * Puppeteer 브라우저 인스턴스 관리
 */

import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { BrowserConfig, loadBrowserConfig, ViewportConfig, DEFAULT_VIEWPORT } from '../../config/capture.config.js';

export class BrowserManager {
  private browser: Browser | null = null;
  private config: BrowserConfig;

  constructor(config?: Partial<BrowserConfig>) {
    this.config = { ...loadBrowserConfig(), ...config };
  }

  async launch(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const launchOptions: PuppeteerLaunchOptions = {
      headless: this.config.headless,
      args: this.config.args,
      defaultViewport: this.config.defaultViewport,
      timeout: this.config.timeout,
    };

    this.browser = await puppeteer.launch(launchOptions);
    console.log('[BrowserManager] Browser launched');
    return this.browser;
  }

  async newPage(viewport?: ViewportConfig): Promise<Page> {
    if (!this.browser) {
      await this.launch();
    }

    const page = await this.browser!.newPage();

    const viewportConfig = viewport || DEFAULT_VIEWPORT;
    await page.setViewport({
      width: viewportConfig.width,
      height: viewportConfig.height,
      deviceScaleFactor: viewportConfig.deviceScaleFactor || 1,
    });

    // 기본 타임아웃 설정
    page.setDefaultTimeout(this.config.timeout);
    page.setDefaultNavigationTimeout(this.config.timeout);

    // 콘솔 로그 캡처 (디버깅용)
    page.on('console', (msg) => {
      if (process.env.DEBUG === 'true') {
        console.log(`[Page Console] ${msg.type()}: ${msg.text()}`);
      }
    });

    // 페이지 에러 캡처
    page.on('pageerror', (error) => {
      console.error(`[Page Error] ${error.message}`);
    });

    return page;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[BrowserManager] Browser closed');
    }
  }

  async getPages(): Promise<Page[]> {
    if (!this.browser) {
      return [];
    }
    return this.browser.pages();
  }

  isRunning(): boolean {
    return this.browser !== null && this.browser.connected;
  }
}

// 싱글톤 인스턴스
let browserManagerInstance: BrowserManager | null = null;

export function getBrowserManager(config?: Partial<BrowserConfig>): BrowserManager {
  if (!browserManagerInstance) {
    browserManagerInstance = new BrowserManager(config);
  }
  return browserManagerInstance;
}

export async function closeBrowserManager(): Promise<void> {
  if (browserManagerInstance) {
    await browserManagerInstance.close();
    browserManagerInstance = null;
  }
}
