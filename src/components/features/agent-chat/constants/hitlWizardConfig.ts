import { ToolType } from '../types';

/**
 * HITL Multi-Step Wizard 설정
 *
 * 단일 HITL pause 내에서 sub-step 네비게이션을 지원하기 위한 설정 레지스트리.
 * 시나리오 hook은 변경 없이, HITLFloatingPanel 내부에서 sub-step을 관리한다.
 */

// 개별 sub-step 정의
export interface HitlSubStep {
  id: string;           // 고유 sub-step 식별자 (e.g., 'topic_selection')
  title: string;        // 패널 헤더에 표시할 질문 텍스트
  renderKey: string;    // HITLFloatingPanel에서 렌더 함수 매핑에 사용하는 키
}

// 특정 toolType에 대한 wizard 설정
export interface HitlWizardConfig {
  toolType: ToolType;
  subSteps: HitlSubStep[];
}

// toolType → wizard 설정 레지스트리
export const HITL_WIZARD_CONFIGS: Partial<Record<ToolType, HitlWizardConfig>> = {
  // PPT 시나리오: ppt_setup → 2단계
  ppt_setup: {
    toolType: 'ppt_setup',
    subSteps: [
      {
        id: 'topic_selection',
        title: '포함할 주요 내용을 선택하세요.',
        renderKey: 'ppt_setup_topics',
      },
      {
        id: 'slide_count',
        title: '슬라이드 수를 설정하세요.',
        renderKey: 'ppt_setup_slide_count',
      },
    ],
  },

  // PPT 시나리오: theme_font_select → 2단계
  theme_font_select: {
    toolType: 'theme_font_select',
    subSteps: [
      {
        id: 'theme_selection',
        title: '테마를 선택하세요.',
        renderKey: 'theme_font_theme',
      },
      {
        id: 'font_selection',
        title: '폰트를 선택하세요.',
        renderKey: 'theme_font_font',
      },
    ],
  },

  // 매출 분석 시나리오: analysis_scope_confirm → 3단계
  // 각 sub-step은 정보 확인만 하고, 마지막 단계에서 액션 버튼(확인/기간 변경/범위 조정) 표시
  analysis_scope_confirm: {
    toolType: 'analysis_scope_confirm',
    subSteps: [
      {
        id: 'period_confirm',
        title: '분석 기간을 확인하세요.',
        renderKey: 'scope_period',
      },
      {
        id: 'scope_selection',
        title: '분석 범위를 확인하세요.',
        renderKey: 'scope_range',
      },
      {
        id: 'data_source_confirm',
        title: '데이터 소스를 확인하세요.',
        renderKey: 'scope_data_sources',
      },
    ],
  },
};

// Helper: toolType에 해당하는 wizard 설정 조회 (없으면 undefined → 단일 단계)
export const getWizardConfig = (toolType: ToolType): HitlWizardConfig | undefined => {
  return HITL_WIZARD_CONFIGS[toolType];
};

// Helper: multi-step wizard 여부 확인
export const isMultiStepHitl = (toolType: ToolType): boolean => {
  const config = HITL_WIZARD_CONFIGS[toolType];
  return !!config && config.subSteps.length > 1;
};
