/**
 * 캡처 시나리오 레지스트리
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ScreenConfig, ScreenStatesConfig } from '../../../config/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// screen-states.json 로드
const screenStatesPath = path.resolve(__dirname, '../../../config/screen-states.json');
const screenStatesData = JSON.parse(fs.readFileSync(screenStatesPath, 'utf-8')) as ScreenStatesConfig;

/**
 * 모든 화면 설정 가져오기
 */
export function getAllScreens(): ScreenConfig[] {
  return screenStatesData.screens;
}

/**
 * 특정 화면 설정 가져오기
 */
export function getScreenById(screenId: string): ScreenConfig | undefined {
  return screenStatesData.screens.find((screen) => screen.id === screenId);
}

/**
 * 컴포넌트 이름으로 화면 설정 가져오기
 */
export function getScreenByComponent(componentName: string): ScreenConfig | undefined {
  return screenStatesData.screens.find((screen) => screen.component === componentName);
}

/**
 * 인증이 필요한 화면만 가져오기
 */
export function getAuthRequiredScreens(): ScreenConfig[] {
  return screenStatesData.screens.filter((screen) => screen.requiresAuth);
}

/**
 * 인증이 필요없는 화면만 가져오기
 */
export function getPublicScreens(): ScreenConfig[] {
  return screenStatesData.screens.filter((screen) => !screen.requiresAuth);
}

/**
 * 기본 인증 정보 가져오기
 */
export function getDefaultAuth(): { email: string; password: string } {
  return screenStatesData.defaultAuth;
}

/**
 * 대기 기본값 가져오기
 */
export function getWaitDefaults(): { networkIdle: number; afterInteraction: number; afterNavigation: number } {
  return screenStatesData.waitDefaults;
}

/**
 * 시나리오 ID 목록 가져오기
 */
export function getScenarioIds(): string[] {
  return screenStatesData.screens.map((screen) => screen.id);
}

/**
 * 화면 통계 가져오기
 */
export function getScreenStats(): {
  totalScreens: number;
  totalStates: number;
  authRequiredCount: number;
  publicCount: number;
} {
  const screens = screenStatesData.screens;
  return {
    totalScreens: screens.length,
    totalStates: screens.reduce((sum, screen) => sum + screen.states.length, 0),
    authRequiredCount: screens.filter((s) => s.requiresAuth).length,
    publicCount: screens.filter((s) => !s.requiresAuth).length,
  };
}

/**
 * 시나리오 설정 전체 가져오기
 */
export function getScreenStatesConfig(): ScreenStatesConfig {
  return screenStatesData;
}

// 개별 시나리오 내보내기
export { screenStatesData };
