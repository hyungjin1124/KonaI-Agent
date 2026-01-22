/**
 * 스크린샷 캡처 자동화를 위한 외부 상태 주입 훅
 *
 * 이 훅은 Puppeteer 등 자동화 도구에서 React 앱의 상태를 외부에서 제어할 수 있게 합니다.
 * window.__KONA_INJECTED_STATE__에 저장된 상태를 읽어 콜백을 실행합니다.
 */

import { useEffect, useCallback } from 'react';
import type { AppViewMode } from '../types';
import type { SampleInterfaceContext } from '../types';

// 주입 가능한 상태 타입 정의
export interface InjectedState {
  viewMode?: AppViewMode;
  isLoggedIn?: boolean;
  agentContext?: SampleInterfaceContext;
  agentQuery?: string;
  // 추가 상태들
  showDashboard?: boolean;
  activeDashboardTab?: 'default' | 'custom';
  isEditMode?: boolean;
}

// 상태 변경 핸들러 타입
export interface StateInjectionHandlers {
  setViewMode?: (mode: AppViewMode) => void;
  setIsLoggedIn?: (value: boolean) => void;
  setAgentContext?: (context: SampleInterfaceContext | null) => void;
  setAgentQuery?: (query: string | undefined) => void;
  // 컴포넌트별 핸들러
  setShowDashboard?: (value: boolean) => void;
  setActiveDashboardTab?: (tab: 'default' | 'custom') => void;
  setIsEditMode?: (value: boolean) => void;
}

// window 객체 확장
declare global {
  interface Window {
    __KONA_INJECTED_STATE__?: InjectedState;
    __KONA_STATE_HANDLERS__?: StateInjectionHandlers;
  }
}

/**
 * 캡처 자동화용 상태 주입 훅
 * @param handlers - 상태 변경 핸들러들
 */
export function useCaptureStateInjection(handlers: StateInjectionHandlers): void {
  // 핸들러들을 window 객체에 노출 (Puppeteer에서 직접 호출 가능)
  useEffect(() => {
    window.__KONA_STATE_HANDLERS__ = handlers;
    return () => {
      delete window.__KONA_STATE_HANDLERS__;
    };
  }, [handlers]);

  // 상태 주입 이벤트 핸들러
  const handleStateInjection = useCallback((event: CustomEvent<InjectedState>) => {
    const state = event.detail;

    console.log('[CaptureStateInjection] 상태 주입 수신:', state);

    // 각 상태에 대해 해당 핸들러 호출
    if (state.viewMode !== undefined && handlers.setViewMode) {
      handlers.setViewMode(state.viewMode);
    }

    if (state.isLoggedIn !== undefined && handlers.setIsLoggedIn) {
      handlers.setIsLoggedIn(state.isLoggedIn);
    }

    if (state.agentContext !== undefined && handlers.setAgentContext) {
      handlers.setAgentContext(state.agentContext);
    }

    if (state.agentQuery !== undefined && handlers.setAgentQuery) {
      handlers.setAgentQuery(state.agentQuery);
    }

    if (state.showDashboard !== undefined && handlers.setShowDashboard) {
      handlers.setShowDashboard(state.showDashboard);
    }

    if (state.activeDashboardTab !== undefined && handlers.setActiveDashboardTab) {
      handlers.setActiveDashboardTab(state.activeDashboardTab);
    }

    if (state.isEditMode !== undefined && handlers.setIsEditMode) {
      handlers.setIsEditMode(state.isEditMode);
    }
  }, [handlers]);

  // 이벤트 리스너 등록
  useEffect(() => {
    const eventHandler = (e: Event) => handleStateInjection(e as CustomEvent<InjectedState>);

    window.addEventListener('kona-state-injected', eventHandler);

    // 초기 상태 확인 (이벤트 발생 전에 상태가 설정된 경우)
    if (window.__KONA_INJECTED_STATE__) {
      handleStateInjection(
        new CustomEvent('kona-state-injected', {
          detail: window.__KONA_INJECTED_STATE__
        })
      );
    }

    return () => {
      window.removeEventListener('kona-state-injected', eventHandler);
    };
  }, [handleStateInjection]);
}

export default useCaptureStateInjection;
