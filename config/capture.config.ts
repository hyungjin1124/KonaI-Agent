/**
 * KonaI-Agent 스크린샷 캡처 설정
 */

export interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor?: number;
}

export interface CaptureConfig {
  baseUrl: string;
  viewport: ViewportConfig;
  outputDir: string;
  format: 'png' | 'jpeg' | 'webp';
  quality?: number;
  fullPage: boolean;
  waitStrategy: 'networkidle0' | 'networkidle2' | 'domcontentloaded' | 'load';
  timeout: number;
  locale: 'ko-KR' | 'en-US';
}

export interface BrowserConfig {
  headless: boolean;
  args: string[];
  defaultViewport: ViewportConfig | null;
  timeout: number;
}

export const DEFAULT_VIEWPORT: ViewportConfig = {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
};

export const MOBILE_VIEWPORT: ViewportConfig = {
  width: 390,
  height: 844,
  deviceScaleFactor: 3,
};

export const TABLET_VIEWPORT: ViewportConfig = {
  width: 820,
  height: 1180,
  deviceScaleFactor: 2,
};

export const DEFAULT_CAPTURE_CONFIG: CaptureConfig = {
  baseUrl: 'http://localhost:3000',
  viewport: DEFAULT_VIEWPORT,
  outputDir: 'outputs/screenshots',
  format: 'png',
  fullPage: false,
  waitStrategy: 'networkidle0',
  timeout: 30000,
  locale: 'ko-KR',
};

export const DEFAULT_BROWSER_CONFIG: BrowserConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080',
  ],
  defaultViewport: DEFAULT_VIEWPORT,
  timeout: 60000,
};

export const CI_BROWSER_CONFIG: BrowserConfig = {
  ...DEFAULT_BROWSER_CONFIG,
  args: [
    ...DEFAULT_BROWSER_CONFIG.args,
    '--disable-software-rasterizer',
    '--disable-extensions',
  ],
};

export function loadConfig(): CaptureConfig {
  return {
    ...DEFAULT_CAPTURE_CONFIG,
    baseUrl: process.env.CAPTURE_BASE_URL || DEFAULT_CAPTURE_CONFIG.baseUrl,
    outputDir: process.env.CAPTURE_OUTPUT_DIR || DEFAULT_CAPTURE_CONFIG.outputDir,
    locale: (process.env.CAPTURE_LOCALE as 'ko-KR' | 'en-US') || DEFAULT_CAPTURE_CONFIG.locale,
  };
}

export function loadBrowserConfig(): BrowserConfig {
  const isCI = process.env.CI === 'true';
  return isCI ? CI_BROWSER_CONFIG : DEFAULT_BROWSER_CONFIG;
}
