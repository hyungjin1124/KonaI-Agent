/**
 * 대기 관련 유틸리티 함수
 */

import { Page } from 'puppeteer';

// Helper function for waiting
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface WaitOptions {
  timeout?: number;
  polling?: number;
}

/**
 * 조건이 참이 될 때까지 대기
 */
export async function waitForCondition(
  page: Page,
  condition: () => Promise<boolean> | boolean,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000, polling = 100 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await delay(polling);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * 페이지 로드 완료 대기
 */
export async function waitForPageLoad(page: Page, timeout = 30000): Promise<void> {
  await page.waitForFunction(
    () => document.readyState === 'complete',
    { timeout }
  );
}

/**
 * React 렌더링 완료 대기
 */
export async function waitForReactRender(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    () => {
      // React 18의 Concurrent Mode에서 렌더링 완료 확인
      const reactRoot = document.getElementById('root');
      if (!reactRoot) return false;

      // DOM이 비어있지 않은지 확인
      return reactRoot.children.length > 0;
    },
    { timeout }
  );

  // 추가 안정화 대기
  await delay(200);
}

/**
 * Recharts 차트 렌더링 완료 대기
 */
export async function waitForChartsRender(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    () => {
      const charts = document.querySelectorAll('.recharts-wrapper');
      if (charts.length === 0) return true; // 차트가 없으면 바로 반환

      // 모든 차트가 렌더링되었는지 확인
      return Array.from(charts).every((chart) => {
        const svg = chart.querySelector('svg');
        return svg && svg.children.length > 0;
      });
    },
    { timeout }
  );
}

/**
 * 그리드 레이아웃 렌더링 완료 대기
 */
export async function waitForGridLayout(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    () => {
      const grid = document.querySelector('.react-grid-layout');
      if (!grid) return true;

      const items = grid.querySelectorAll('.react-grid-item');
      return items.length > 0;
    },
    { timeout }
  );
}

/**
 * 이미지 로딩 완료 대기
 */
export async function waitForImages(page: Page, timeout = 10000): Promise<void> {
  await page.waitForFunction(
    () => {
      const images = document.querySelectorAll('img');
      return Array.from(images).every((img) => img.complete);
    },
    { timeout }
  );
}

/**
 * 폰트 로딩 완료 대기
 */
export async function waitForFonts(page: Page, timeout = 5000): Promise<void> {
  await page.waitForFunction(
    () => document.fonts.ready.then(() => true),
    { timeout }
  );
}

/**
 * 모든 리소스 로딩 완료 대기 (종합)
 */
export async function waitForAllResources(page: Page): Promise<void> {
  await Promise.all([
    waitForPageLoad(page),
    waitForReactRender(page),
    waitForImages(page).catch(() => {}), // 이미지 없어도 계속 진행
    waitForFonts(page).catch(() => {}), // 폰트 로딩 실패해도 계속 진행
  ]);

  // 차트와 그리드는 선택적
  await Promise.all([
    waitForChartsRender(page).catch(() => {}),
    waitForGridLayout(page).catch(() => {}),
  ]);

  // 최종 안정화 대기
  await delay(500);
}

/**
 * 특정 텍스트가 나타날 때까지 대기
 */
export async function waitForText(
  page: Page,
  text: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000 } = options;

  await page.waitForFunction(
    (searchText) => document.body.innerText.includes(searchText),
    { timeout },
    text
  );
}

/**
 * 특정 텍스트가 사라질 때까지 대기
 */
export async function waitForTextToDisappear(
  page: Page,
  text: string,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000 } = options;

  await page.waitForFunction(
    (searchText) => !document.body.innerText.includes(searchText),
    { timeout },
    text
  );
}

/**
 * 로딩 인디케이터가 사라질 때까지 대기
 */
export async function waitForLoadingToComplete(
  page: Page,
  loadingSelector = '[data-testid="loading"], .loading, .spinner',
  timeout = 30000
): Promise<void> {
  try {
    await page.waitForSelector(loadingSelector, { hidden: true, timeout });
  } catch {
    // 로딩 요소가 없으면 무시
  }
}
