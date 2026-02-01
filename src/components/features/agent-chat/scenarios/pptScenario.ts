import { ScenarioStep, ScenarioMessage, ToolType, ToolStatus, HitlOption } from '../types';
import { DEFAULT_DATA_SOURCE_OPTIONS } from '../components/ToolCall/constants';

/**
 * PPT 생성 시나리오 단계 정의
 * - 도구 호출과 에이전트 텍스트가 번갈아 표시
 * - HITL 단계에서 사용자 입력 대기
 */
export const PPT_SCENARIO_STEPS: ScenarioStep[] = [
  // 1. 에이전트 초기 응답
  {
    id: 'agent_greeting',
    type: 'agent-text',
    agentContent: 'Q4 2025 경영 실적 보고서 PPT 생성을 요청하셨군요. 작업 계획을 수립하고 필요한 데이터를 준비하겠습니다.',
    delayMs: 500,
  },

  // 2. 도구 사용 #1: 계획 수립
  {
    id: 'tool_planning',
    type: 'tool-call',
    toolType: 'deep_thinking',
    delayMs: 4000,
    dependsOn: 'agent_greeting',
  },

  // 4. 도구 사용 #3: 데이터 소스 선택 (HITL #1)
  {
    id: 'tool_data_source',
    type: 'tool-call',
    toolType: 'data_source_select',
    isHitl: true,
    delayMs: 800,
    dependsOn: 'tool_planning',
  },

  // 5. 에이전트 응답 (데이터 소스 선택 후)
  {
    id: 'agent_data_source_confirm',
    type: 'agent-text',
    agentContent: '사내 ERP 시스템을 데이터 소스로 선택하셨습니다. 연결을 시작합니다.',
    delayMs: 500,
    dependsOn: 'tool_data_source',
  },

  // 6. 도구 사용 #4: ERP 연결
  {
    id: 'tool_erp_connect',
    type: 'tool-call',
    toolType: 'erp_connect',
    delayMs: 3000,
    dependsOn: 'agent_data_source_confirm',
  },

  // 7. 도구 사용 #5: 병렬 데이터 조회 실행
  {
    id: 'tool_parallel_query',
    type: 'tool-call',
    toolType: 'parallel_data_query',
    delayMs: 2000,
    dependsOn: 'tool_erp_connect',
  },

  // 8. 도구 사용 #6: 손익계산서 조회 결과
  {
    id: 'tool_data_query_1',
    type: 'tool-call',
    toolType: 'data_query',
    delayMs: 1500,
    dependsOn: 'tool_parallel_query',
  },

  // 9. 도구 사용 #7: 사업부별 손익 조회 결과
  {
    id: 'tool_data_query_2',
    type: 'tool-call',
    toolType: 'data_query',
    delayMs: 1500,
    dependsOn: 'tool_data_query_1',
  },

  // 10. 도구 사용 #8: 생산/물류 KPI 조회 결과
  {
    id: 'tool_data_query_3',
    type: 'tool-call',
    toolType: 'data_query',
    delayMs: 1500,
    dependsOn: 'tool_data_query_2',
  },

  // 11. 도구 사용 #9: 고객/매출 분석 조회 결과
  {
    id: 'tool_data_query_4',
    type: 'tool-call',
    toolType: 'data_query',
    delayMs: 1500,
    dependsOn: 'tool_data_query_3',
  },

  // 12. 도구 사용 #10: 데이터 검증 (HITL #2)
  {
    id: 'tool_data_validation',
    type: 'tool-call',
    toolType: 'data_validation',
    isHitl: true,
    delayMs: 800,
    dependsOn: 'tool_data_query_4',
  },

  // 9. 에이전트 응답 (데이터 검증 후)
  {
    id: 'agent_validation_confirm',
    type: 'agent-text',
    agentContent: '데이터가 확인되었습니다. 이제 PPT 세부 설정을 진행합니다.',
    delayMs: 500,
    dependsOn: 'tool_data_validation',
  },

  // 10. 도구 사용 #7: PPT 세부 설정 (HITL #3)
  {
    id: 'tool_ppt_setup',
    type: 'tool-call',
    toolType: 'ppt_setup',
    isHitl: true,
    delayMs: 500,
    dependsOn: 'agent_validation_confirm',
  },

  // 11. 에이전트 응답 (PPT 설정 후)
  {
    id: 'agent_setup_confirm',
    type: 'agent-text',
    agentContent: '설정이 완료되었습니다. 시장 정보를 검색하고 슬라이드를 생성합니다.',
    delayMs: 500,
    dependsOn: 'tool_ppt_setup',
  },

  // 12. 도구 사용 #8: 웹 검색
  {
    id: 'tool_web_search',
    type: 'tool-call',
    toolType: 'web_search',
    delayMs: 3500,
    dependsOn: 'agent_setup_confirm',
  },

  // 13. 도구 사용 #9: 슬라이드 계획
  {
    id: 'tool_slide_planning',
    type: 'tool-call',
    toolType: 'slide_planning',
    delayMs: 3000,
    dependsOn: 'tool_web_search',
  },

  // 14. 도구 사용 #10: 슬라이드 제작 (비동기 - PPTGenPanel 완료 대기)
  {
    id: 'tool_slide_generation',
    type: 'tool-call',
    toolType: 'slide_generation',
    isAsyncTool: true, // PPTGenPanel의 onComplete 콜백을 기다림
    delayMs: 500, // 초기 UI 표시 지연만
    dependsOn: 'tool_slide_planning',
  },

  // 15. 도구 사용 #11: 완료
  {
    id: 'tool_completion',
    type: 'tool-call',
    toolType: 'completion',
    delayMs: 1500,
    dependsOn: 'tool_slide_generation',
  },

  // 16. 에이전트 최종 응답
  {
    id: 'agent_final',
    type: 'agent-text',
    agentContent: 'final', // 특별 마커 - PPTDoneResponse 렌더링
    delayMs: 0,
    dependsOn: 'tool_completion',
  },
];

// 기본 데이터 검증 정보
export const DEFAULT_VALIDATION_DATA = {
  revenue: '1,258억원',
  revenueGrowth: 'YoY +12.3%',
  operatingProfit: '189억원',
  operatingProfitGrowth: 'YoY +20.3%',
  dataDate: '2025-12-31',
  dataSources: ['영림원 ERP', 'E2MAX MES', 'Platform Portal'],
};

// 시나리오 단계 ID로 단계 찾기
export const findStepById = (stepId: string): ScenarioStep | undefined => {
  return PPT_SCENARIO_STEPS.find(step => step.id === stepId);
};

// 다음 단계 찾기
export const findNextStep = (currentStepId: string): ScenarioStep | undefined => {
  const currentIndex = PPT_SCENARIO_STEPS.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex >= PPT_SCENARIO_STEPS.length - 1) {
    return undefined;
  }
  return PPT_SCENARIO_STEPS[currentIndex + 1];
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
