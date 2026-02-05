import { ScenarioStep, ScenarioMessage, ToolType, ToolStatus, HitlOption, TaskGroup } from '../types';

/**
 * 매출 분석 시나리오 단계 정의 (신규)
 *
 * 5단계 흐름:
 * Phase 1: 분석 준비 - 요청 분석 → 분석 범위 확인(HITL) → 데이터 소스 연결
 * Phase 2: 데이터 수집 - 재무 데이터 수집 → 사업부별 실적 수집 → 운영 지표 수집
 * Phase 3: 데이터 분석 - 매출 동인 분석 → 수익성 분석 → 이상 징후 탐지 → 데이터 검증(HITL)
 * Phase 4: 인사이트 도출 - 핵심 인사이트 도출 → 시각화 생성
 * Phase 5: 결과 정리 - 분석 완료
 */
export const SALES_ANALYSIS_SCENARIO_STEPS: ScenarioStep[] = [
  // =============================================
  // Phase 1: 분석 준비
  // =============================================

  // 1. 에이전트 초기 응답
  {
    id: 'agent_greeting',
    type: 'agent-text',
    agentContent: '경영 실적 분석을 요청하셨군요. 분석 범위를 파악하고 데이터를 수집하겠습니다.',
    delayMs: 500,
  },

  // 2. 도구 사용 #1: 요청 분석
  {
    id: 'tool_request_analysis',
    type: 'tool-call',
    toolType: 'request_analysis',
    delayMs: 3000,
    dependsOn: 'agent_greeting',
  },

  // 3. 도구 사용 #2: 분석 범위 확인 (HITL #1)
  {
    id: 'tool_analysis_scope_confirm',
    type: 'tool-call',
    toolType: 'analysis_scope_confirm',
    isHitl: true,
    delayMs: 500,
    dependsOn: 'tool_request_analysis',
  },

  // 4. 에이전트 응답 (분석 범위 확정 후)
  {
    id: 'agent_scope_confirmed',
    type: 'agent-text',
    agentContent: '분석 범위가 확정되었습니다. 데이터 소스에 연결하여 필요한 데이터를 수집합니다.',
    delayMs: 500,
    dependsOn: 'tool_analysis_scope_confirm',
  },

  // 5. 도구 사용 #3: 데이터 소스 연결
  {
    id: 'tool_data_source_connect',
    type: 'tool-call',
    toolType: 'data_source_connect',
    delayMs: 2500,
    dependsOn: 'agent_scope_confirmed',
  },

  // =============================================
  // Phase 2: 데이터 수집
  // =============================================

  // 6. 도구 사용 #4: 재무 데이터 수집
  {
    id: 'tool_financial_data_collection',
    type: 'tool-call',
    toolType: 'financial_data_collection',
    delayMs: 3000,
    dependsOn: 'tool_data_source_connect',
  },

  // 7. 도구 사용 #5: 사업부별 실적 수집
  {
    id: 'tool_division_data_collection',
    type: 'tool-call',
    toolType: 'division_data_collection',
    delayMs: 2500,
    dependsOn: 'tool_financial_data_collection',
  },

  // 8. 도구 사용 #6: 운영 지표 수집
  {
    id: 'tool_operation_data_collection',
    type: 'tool-call',
    toolType: 'operation_data_collection',
    delayMs: 2000,
    dependsOn: 'tool_division_data_collection',
  },

  // =============================================
  // Phase 3: 데이터 분석
  // =============================================

  // 9. 에이전트 응답 (데이터 수집 완료)
  {
    id: 'agent_data_collected',
    type: 'agent-text',
    agentContent: '데이터 수집이 완료되었습니다. 이제 수집된 데이터를 분석합니다.',
    delayMs: 500,
    dependsOn: 'tool_operation_data_collection',
  },

  // 10. 도구 사용 #7: 매출 동인 분석
  {
    id: 'tool_revenue_driver_analysis',
    type: 'tool-call',
    toolType: 'revenue_driver_analysis',
    delayMs: 3000,
    dependsOn: 'agent_data_collected',
  },

  // 11. 도구 사용 #8: 수익성 분석
  {
    id: 'tool_profitability_analysis',
    type: 'tool-call',
    toolType: 'profitability_analysis',
    delayMs: 2500,
    dependsOn: 'tool_revenue_driver_analysis',
  },

  // 12. 도구 사용 #9: 이상 징후 탐지
  {
    id: 'tool_anomaly_detection',
    type: 'tool-call',
    toolType: 'anomaly_detection',
    delayMs: 2500,
    dependsOn: 'tool_profitability_analysis',
  },

  // 13. 도구 사용 #10: 데이터 검증 (HITL #2)
  {
    id: 'tool_data_verification',
    type: 'tool-call',
    toolType: 'data_verification',
    isHitl: true,
    delayMs: 500,
    dependsOn: 'tool_anomaly_detection',
  },

  // =============================================
  // Phase 4: 인사이트 도출
  // =============================================

  // 14. 에이전트 응답 (데이터 분석 완료)
  {
    id: 'agent_analysis_complete',
    type: 'agent-text',
    agentContent: '데이터 분석이 완료되었습니다. 핵심 인사이트를 도출하고 시각화를 생성합니다.',
    delayMs: 500,
    dependsOn: 'tool_data_verification',
  },

  // 15. 도구 사용 #11: 핵심 인사이트 도출
  {
    id: 'tool_key_insight_generation',
    type: 'tool-call',
    toolType: 'key_insight_generation',
    delayMs: 3500,
    dependsOn: 'agent_analysis_complete',
  },

  // 16. 도구 사용 #12: 시각화 생성
  {
    id: 'tool_visualization_generation',
    type: 'tool-call',
    toolType: 'visualization_generation',
    delayMs: 4000,
    dependsOn: 'tool_key_insight_generation',
  },

  // =============================================
  // Phase 5: 결과 정리
  // =============================================

  // 17. 도구 사용 #13: 분석 완료
  {
    id: 'tool_analysis_completion',
    type: 'tool-call',
    toolType: 'analysis_completion',
    delayMs: 1500,
    dependsOn: 'tool_visualization_generation',
  },

  // 18. 에이전트 최종 응답
  {
    id: 'agent_final',
    type: 'agent-text',
    agentContent: 'final', // 특별 마커 - SalesAnalysisDoneResponse 렌더링
    delayMs: 0,
    dependsOn: 'tool_analysis_completion',
  },
];

// Progress 태스크 그룹 (우측 사이드바 Progress 표시용)
export const SALES_ANALYSIS_PROGRESS_TASK_GROUPS = [
  {
    id: 'preparation',
    label: '분석 준비',
    stepIds: ['agent_greeting', 'tool_request_analysis', 'tool_analysis_scope_confirm', 'agent_scope_confirmed', 'tool_data_source_connect']
  },
  {
    id: 'data_collection',
    label: '데이터 수집',
    stepIds: ['tool_financial_data_collection', 'tool_division_data_collection', 'tool_operation_data_collection']
  },
  {
    id: 'analysis',
    label: '데이터 분석',
    stepIds: ['agent_data_collected', 'tool_revenue_driver_analysis', 'tool_profitability_analysis', 'tool_anomaly_detection', 'tool_data_verification']
  },
  {
    id: 'insight',
    label: '인사이트 도출',
    stepIds: ['agent_analysis_complete', 'tool_key_insight_generation', 'tool_visualization_generation']
  },
  {
    id: 'completion',
    label: '분석 완료',
    stepIds: ['tool_analysis_completion', 'agent_final']
  },
];

// 렌더링 태스크 그룹 (Claude Cowork 스타일 아코디언용)
export const SALES_ANALYSIS_RENDER_TASK_GROUPS: TaskGroup[] = [
  {
    id: 'analysis_preparation',
    label: '분석 준비',
    toolStepIds: ['tool_request_analysis', 'tool_analysis_scope_confirm', 'tool_data_source_connect'],
    followingTextStepId: 'agent_scope_confirmed',
  },
  {
    id: 'data_collection',
    label: '데이터 수집',
    toolStepIds: ['tool_financial_data_collection', 'tool_division_data_collection', 'tool_operation_data_collection'],
    followingTextStepId: 'agent_data_collected',
  },
  {
    id: 'data_analysis',
    label: '데이터 분석',
    toolStepIds: ['tool_revenue_driver_analysis', 'tool_profitability_analysis', 'tool_anomaly_detection', 'tool_data_verification'],
    followingTextStepId: 'agent_analysis_complete',
  },
  {
    id: 'insight_generation',
    label: '인사이트 도출',
    toolStepIds: ['tool_key_insight_generation', 'tool_visualization_generation'],
  },
  {
    id: 'completion',
    label: '분석 완료',
    toolStepIds: ['tool_analysis_completion'],
    followingTextStepId: 'agent_final',
  },
];

// 분석 범위 확인 HITL용 기본 데이터
export const DEFAULT_ANALYSIS_SCOPE_DATA = {
  period: '2025년 12월 (월간 분석)',
  comparisonPeriod: '2025년 11월 (전월) / 2024년 12월 (전년 동월)',
  analysisScope: ['재무 실적', '사업부별 성과', '운영 KPI'],
  dataSources: ['영림원 ERP', 'E2MAX MES', 'Platform Portal'],
};

// 데이터 검증 HITL용 기본 데이터
export const DEFAULT_DATA_VERIFICATION_DATA = {
  keyMetrics: [
    { label: '월 매출', value: '420억원', change: '+13.5%' },
    { label: '영업이익', value: '63억원', change: '+15.2%' },
    { label: '영업이익률', value: '15.0%', change: '+0.3%p' },
    { label: '순이익', value: '48억원', change: '+12.8%' },
  ],
  dataAsOf: '2025-12-31',
  sources: ['영림원 ERP', 'E2MAX MES', 'Platform Portal'],
};

// 기본 분석 데이터 (검증 표시용) - 레거시 호환
export const DEFAULT_ANALYSIS_VALIDATION_DATA = {
  revenue: '420억원',
  revenueGrowth: 'MoM +13.5%',
  operatingProfit: '63억원',
  operatingProfitGrowth: 'MoM +15.2%',
  dataDate: '2025-12-31',
  dataSources: ['영림원 ERP', 'E2MAX MES', 'Platform Portal'],
};

// 시나리오 단계 ID로 단계 찾기
export const findStepById = (stepId: string): ScenarioStep | undefined => {
  return SALES_ANALYSIS_SCENARIO_STEPS.find(step => step.id === stepId);
};

// 다음 단계 찾기
export const findNextStep = (currentStepId: string): ScenarioStep | undefined => {
  const currentIndex = SALES_ANALYSIS_SCENARIO_STEPS.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex >= SALES_ANALYSIS_SCENARIO_STEPS.length - 1) {
    return undefined;
  }
  return SALES_ANALYSIS_SCENARIO_STEPS[currentIndex + 1];
};

// HITL 단계인지 확인
export const isHitlStep = (stepId: string): boolean => {
  const step = findStepById(stepId);
  return step?.isHitl === true;
};

// 시나리오 메시지 생성 헬퍼
export const createScenarioMessage = (
  step: ScenarioStep,
  status: ToolStatus = 'pending',
  options?: {
    hitlOptions?: HitlOption[];
    selectedOption?: string;
    input?: Record<string, unknown>;
  }
): ScenarioMessage => {
  return {
    id: `msg-${step.id}-${Date.now()}`,
    type: step.type,
    timestamp: new Date(),
    content: step.agentContent,
    toolType: step.toolType,
    toolStatus: status,
    isHumanInTheLoop: step.isHitl,
    hitlOptions: options?.hitlOptions,
    hitlSelectedOption: options?.selectedOption,
    toolInput: options?.input,
  };
};
