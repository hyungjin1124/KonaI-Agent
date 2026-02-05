import { ToolType, ToolMetadata, HitlOption, ParallelDataQuery, DataQueryResult } from '../../types';
import { PPTConfig } from '../../../../../types';

// =============================================
// PPT Setup Step 정의 (3단계 Wizard UI)
// =============================================

export type PPTSetupStepId = 'content';

export interface PPTSetupStep {
  id: PPTSetupStepId;
  title: string;
  description: string;
}

export const PPT_SETUP_STEPS: PPTSetupStep[] = [
  { id: 'content', title: '콘텐츠 설정', description: '포함할 내용과 슬라이드 수를 설정해 주세요.' },
];

// 테마 옵션
export const PPT_THEME_OPTIONS: PPTConfig['theme'][] = ['Corporate Blue', 'Modern Dark', 'Nature Green'];

// 폰트 옵션
export const PPT_FONT_OPTIONS = ['Pretendard', 'Noto Sans KR', 'Montserrat'];

// 토픽 옵션
export const PPT_TOPIC_OPTIONS = [
  'Executive Summary',
  'Q4 Revenue Overview',
  'YoY Comparison',
  'Regional Performance',
  'Future Outlook',
];

// 도구별 메타데이터 (텍스트 스타일용)
export const TOOL_METADATA: Record<ToolType, ToolMetadata> = {
  ppt_init: {
    id: 'ppt_init',
    label: '프레젠테이션',
    labelRunning: '프레젠테이션 초기화 중...',
    labelComplete: '프레젠테이션 초기화 완료',
    icon: '📋',
  },
  deep_thinking: {
    id: 'deep_thinking',
    label: '계획 수립',
    labelRunning: '작업 계획 수립 중...',
    labelComplete: '계획 수립 완료',
    icon: '🧠',
  },
  data_source_select: {
    id: 'data_source_select',
    label: '데이터 소스 선택',
    labelRunning: '선택 대기 중...',
    labelComplete: '데이터 소스 선택 완료',
    icon: '📊',
  },
  erp_connect: {
    id: 'erp_connect',
    label: 'ERP 연결',
    labelRunning: 'ERP 시스템 연결 중...',
    labelComplete: 'ERP 연결 완료',
    icon: '🔌',
  },
  parallel_data_query: {
    id: 'parallel_data_query',
    label: '병렬 데이터 조회',
    labelRunning: '데이터 조회 실행 중...',
    labelComplete: '데이터 조회 완료',
    icon: '📊',
  },
  data_query: {
    id: 'data_query',
    label: '데이터 조회',
    labelRunning: '데이터 조회 중...',
    labelComplete: '데이터 조회 완료',
    icon: '📑',
  },
  data_validation: {
    id: 'data_validation',
    label: '데이터 검증',
    labelRunning: '검증 대기 중...',
    labelComplete: '데이터 검증 완료',
    icon: '✅',
  },
  ppt_setup: {
    id: 'ppt_setup',
    label: 'PPT 세부 설정',
    labelRunning: '설정 대기 중...',
    labelComplete: 'PPT 설정 완료',
    icon: '🎨',
  },
  web_search: {
    id: 'web_search',
    label: '웹 검색',
    labelRunning: '시장 정보 검색 중...',
    labelComplete: '웹 검색 완료',
    icon: '🔍',
  },
  slide_planning: {
    id: 'slide_planning',
    label: '슬라이드 계획',
    labelRunning: '슬라이드 구성 계획 중...',
    labelComplete: '슬라이드 계획 완료',
    icon: '📝',
  },
  slide_outline_review: {
    id: 'slide_outline_review',
    label: '슬라이드 개요 검토',
    labelRunning: '슬라이드 개요를 검토해 주세요',
    labelComplete: '슬라이드 개요 검토 완료',
    icon: '📋',
  },
  theme_font_select: {
    id: 'theme_font_select',
    label: '테마/폰트 선택',
    labelRunning: '테마와 폰트를 선택해 주세요',
    labelComplete: '테마/폰트 설정 완료',
    icon: '🎨',
  },
  slide_generation: {
    id: 'slide_generation',
    label: '슬라이드 제작',
    labelRunning: '슬라이드 생성 중...',
    labelComplete: '슬라이드 제작 완료',
    icon: '🖼️',
  },
  completion: {
    id: 'completion',
    label: '완료',
    labelRunning: '마무리 중...',
    labelComplete: 'PPT 생성 완료',
    icon: '🎉',
  },
  todo_update: {
    id: 'todo_update',
    label: '진행 상황',
    labelRunning: '상태 업데이트 중...',
    labelComplete: '진행 상황 업데이트',
    icon: '📋',
  },
  // 레거시 매출 분석 도구 (호환성 유지)
  trend_analysis: {
    id: 'trend_analysis',
    label: '트렌드 분석',
    labelRunning: '매출 트렌드 분석 중...',
    labelComplete: '트렌드 분석 완료',
    icon: '',
  },
  insight_generation: {
    id: 'insight_generation',
    label: '인사이트 도출',
    labelRunning: '핵심 인사이트 생성 중...',
    labelComplete: '인사이트 도출 완료',
    icon: '',
  },
  visualization: {
    id: 'visualization',
    label: '시각화 생성',
    labelRunning: '차트 생성 중...',
    labelComplete: '시각화 완료',
    icon: '',
  },

  // =============================================
  // 매출 분석 시나리오 신규 도구 (13개)
  // =============================================

  // Phase 1: 분석 준비
  request_analysis: {
    id: 'request_analysis',
    label: '요청 분석',
    labelRunning: '요청 내용을 분석하고 있습니다...',
    labelComplete: '요청 분석 완료',
    icon: '',
    subtools: [
      { id: 'keyword_extraction', label: '키워드 추출', description: '분석 대상, 기간, 지표 등 핵심 키워드 추출' },
      { id: 'scope_identification', label: '분석 범위 파악', description: '재무/운영/고객 등 분석 영역 식별' },
      { id: 'task_planning', label: '작업 계획 수립', description: '데이터 수집 및 분석 순서 계획' },
    ],
  },
  analysis_scope_confirm: {
    id: 'analysis_scope_confirm',
    label: '분석 범위 확인',
    labelRunning: '분석 범위를 확인해 주세요',
    labelComplete: '분석 범위 확정',
    icon: '',
  },
  data_source_connect: {
    id: 'data_source_connect',
    label: '데이터 소스 연결',
    labelRunning: '데이터 소스에 연결하고 있습니다...',
    labelComplete: '데이터 소스 연결 완료',
    icon: '',
    subtools: [
      { id: 'erp_connection', label: 'ERP 시스템 연결', source: '영림원 ERP', description: '재무/회계 데이터 소스' },
      { id: 'mes_connection', label: 'MES 시스템 연결', source: 'E2MAX MES', description: '생산/물류 데이터 소스' },
      { id: 'portal_connection', label: 'CRM/Portal 연결', source: 'Platform Portal', description: '고객/매출 데이터 소스' },
    ],
  },

  // Phase 2: 데이터 수집
  financial_data_collection: {
    id: 'financial_data_collection',
    label: '재무 데이터 수집',
    labelRunning: '재무 데이터를 수집하고 있습니다...',
    labelComplete: '재무 데이터 수집 완료',
    icon: '',
    subtools: [
      { id: 'income_statement_query', label: '손익계산서 조회', source: '영림원 ERP', metrics: ['매출액', '매출원가', '매출총이익', '영업이익', '당기순이익'] },
      { id: 'balance_sheet_query', label: '재무상태표 조회', source: '영림원 ERP', metrics: ['총자산', '총부채', '자기자본', '유동비율'] },
      { id: 'cash_flow_query', label: '현금흐름표 조회', source: '영림원 ERP', metrics: ['영업활동 현금흐름', '투자활동 현금흐름', '재무활동 현금흐름'] },
    ],
  },
  division_data_collection: {
    id: 'division_data_collection',
    label: '사업부별 실적 수집',
    labelRunning: '사업부별 실적을 수집하고 있습니다...',
    labelComplete: '사업부별 실적 수집 완료',
    icon: '',
    subtools: [
      { id: 'platform_division', label: '플랫폼사업부 실적', metrics: ['매출액', '영업이익', '성장률'], finding: '전월 대비 +18%' },
      { id: 'solution_division', label: '솔루션사업부 실적', metrics: ['매출액', '영업이익', '성장률'], finding: '전월 대비 +8%' },
      { id: 'consulting_division', label: '컨설팅사업부 실적', metrics: ['매출액', '영업이익', '성장률'], finding: '전월 대비 +5%' },
    ],
  },
  operation_data_collection: {
    id: 'operation_data_collection',
    label: '운영 지표 수집',
    labelRunning: '운영 지표를 수집하고 있습니다...',
    labelComplete: '운영 지표 수집 완료',
    icon: '',
    subtools: [
      { id: 'production_kpi', label: '생산/물류 KPI', source: 'E2MAX MES', metrics: ['생산 완료율', '적시 납품률', '불량률', '설비 가동률'] },
      { id: 'customer_metrics', label: '고객/매출 지표', source: 'Platform Portal', metrics: ['고객 수', '신규 고객', '고객 유지율', 'NPS'] },
    ],
  },

  // Phase 3: 데이터 분석
  revenue_driver_analysis: {
    id: 'revenue_driver_analysis',
    label: '매출 동인 분석',
    labelRunning: '매출 상승/하락 요인을 분석하고 있습니다...',
    labelComplete: '매출 동인 분석 완료',
    icon: '',
    subtools: [
      { id: 'price_effect', label: '가격 효과 분석', description: 'ASP(평균판매가격) 변동이 매출에 미친 영향', finding: '고부가 제품 비중 확대로 ASP +8% 상승' },
      { id: 'volume_effect', label: '물량 효과 분석', description: '판매량 변동이 매출에 미친 영향', finding: '주요 고객사 수주 확대로 물량 +5% 증가' },
      { id: 'product_mix', label: '제품 믹스 분석', description: '제품군별 매출 구성 변화', finding: '메탈 카드 비중 12% → 18% 확대' },
    ],
  },
  profitability_analysis: {
    id: 'profitability_analysis',
    label: '수익성 분석',
    labelRunning: '수익성 지표를 분석하고 있습니다...',
    labelComplete: '수익성 분석 완료',
    icon: '',
    subtools: [
      { id: 'cost_structure', label: '원가 구조 분석', description: '매출원가율, 고정비/변동비 구조 분석', finding: '원가율 68% → 62%로 6%p 개선' },
      { id: 'margin_trend', label: '마진율 추이 분석', description: '매출총이익률, 영업이익률 추이', finding: '영업이익률 18.2% (전월비 +2.1%p)' },
      { id: 'cost_efficiency', label: '비용 효율성 분석', description: '판관비율, 인건비율 등 비용 효율 지표', finding: '자동화로 단위당 노무비 15% 절감' },
    ],
  },
  anomaly_detection: {
    id: 'anomaly_detection',
    label: '이상 징후 탐지',
    labelRunning: '이상 패턴을 탐지하고 있습니다...',
    labelComplete: '이상 징후 탐지 완료',
    icon: '',
    subtools: [
      { id: 'mom_yoy_comparison', label: '전월/전년 대비 이상치', description: '통계적으로 유의미한 변동 탐지', findings: [{ type: 'positive', text: '매출 +13.5% (전월비) - 연중 최고치' }, { type: 'warning', text: '재고 회전일 증가 (32일 → 38일)' }] },
      { id: 'seasonality_check', label: '계절성 패턴 분석', description: '계절적 트렌드 대비 이탈 여부', finding: '12월 계절적 성수기 효과 반영됨' },
      { id: 'risk_identification', label: '리스크 요인 식별', description: '잠재적 리스크 요인 탐지', finding: '환율 상승에 따른 수입 원자재 비용 증가 우려' },
    ],
  },
  data_verification: {
    id: 'data_verification',
    label: '데이터 검증',
    labelRunning: '분석 데이터를 확인해 주세요',
    labelComplete: '데이터 검증 완료',
    icon: '',
  },

  // Phase 4: 인사이트 도출
  key_insight_generation: {
    id: 'key_insight_generation',
    label: '핵심 인사이트 도출',
    labelRunning: '핵심 인사이트를 도출하고 있습니다...',
    labelComplete: '핵심 인사이트 도출 완료',
    icon: '',
    subtools: [
      { id: 'performance_highlights', label: '성과 하이라이트', description: '주요 성과 및 달성 사항 정리', finding: '월 매출 420억원 - 연중 최고 실적' },
      { id: 'improvement_areas', label: '개선 영역 식별', description: '개선이 필요한 영역 도출', finding: '재고 회전율 개선 필요 (현재 12.4회)' },
      { id: 'strategic_implications', label: '전략적 시사점', description: '경영진 의사결정을 위한 시사점', finding: 'CAPEX 조기 집행 검토 (가동률 한계)' },
    ],
  },
  visualization_generation: {
    id: 'visualization_generation',
    label: '시각화 생성',
    labelRunning: '분석 결과를 시각화하고 있습니다...',
    labelComplete: '시각화 생성 완료',
    icon: '',
    subtools: [
      { id: 'revenue_trend_chart', label: '매출 추이 차트', description: '월별 매출 및 성장률 추이' },
      { id: 'division_comparison_chart', label: '사업부별 비교 차트', description: '사업부별 매출/이익 비교' },
      { id: 'kpi_dashboard', label: 'KPI 대시보드', description: '핵심 KPI 종합 현황' },
    ],
  },

  // Phase 5: 결과 정리
  analysis_completion: {
    id: 'analysis_completion',
    label: '분석 완료',
    labelRunning: '분석 결과를 정리하고 있습니다...',
    labelComplete: '경영 실적 분석 완료',
    icon: '',
    subtools: [
      { id: 'summary_generation', label: '분석 요약', description: '전체 분석 결과 요약문 생성' },
      { id: 'action_suggestions', label: '후속 액션 제안', description: '분석 결과 PPT로 제작, 상세 리포트 다운로드' },
    ],
  },
};

// HITL 도구 목록
export const HITL_TOOLS: ToolType[] = [
  'data_source_select',
  'data_validation',
  'ppt_setup',
  'slide_outline_review',
  'theme_font_select', // 테마/폰트 선택 (NEW)
  // 매출 분석 시나리오 HITL
  'analysis_scope_confirm',
  'data_verification',
];

// 도구가 HITL인지 확인하는 헬퍼
export const isHitlTool = (toolType: ToolType): boolean => {
  return HITL_TOOLS.includes(toolType);
};

// HITL 질문 (수정 3: 플로팅 패널용)
export const HITL_QUESTIONS: Partial<Record<ToolType, string>> = {
  data_source_select: '경영 실적 보고서 제작을 위해 데이터 소스를 선택해 주세요.',
  data_validation: 'ERP에서 조회한 Q4 2025 핵심 데이터를 확인해 주세요.',
  ppt_setup: '포함할 내용과 슬라이드 수를 설정해 주세요.',
  slide_outline_review: '생성된 슬라이드 개요를 검토해 주세요. 우측 사이드바에서 파일을 클릭하면 내용을 확인하고 편집할 수 있습니다.',
  theme_font_select: '슬라이드 디자인을 선택해 주세요.',
  // 매출 분석 시나리오 HITL 질문
  analysis_scope_confirm: '아래 분석 범위가 맞는지 확인해 주세요.',
  data_verification: '분석에 사용된 주요 데이터가 정확한지 확인해 주세요.',
};

// HITL 옵션 (수정 3: 플로팅 패널용)
export const HITL_OPTIONS: Partial<Record<ToolType, HitlOption[]>> = {
  data_validation: [
    { id: 'confirm', label: '확인', description: '데이터가 정확합니다', recommended: true },
    { id: 'modify', label: '수정 요청', description: '데이터 수정이 필요합니다' },
  ],
  ppt_setup: [
    { id: 'short', label: '5-7장 (핵심 요약)', description: '간결하게 핵심만 담은 보고서' },
    { id: 'standard', label: '8-12장 (표준)', description: '일반적인 경영 보고서 분량', recommended: true },
    { id: 'detailed', label: '13장 이상 (상세)', description: '상세 분석이 포함된 보고서' },
  ],
  slide_outline_review: [
    { id: 'approve_all', label: '모두 승인', description: '모든 슬라이드 개요가 적절합니다', recommended: true },
    { id: 'needs_revision', label: '수정 필요', description: '일부 슬라이드 수정이 필요합니다' },
  ],
  // 매출 분석 시나리오 HITL 옵션
  analysis_scope_confirm: [
    { id: 'confirm', label: '확인', description: '설정된 범위로 분석을 진행합니다', recommended: true },
    { id: 'modify_period', label: '기간 변경', description: '분석 기간을 변경합니다' },
    { id: 'modify_scope', label: '범위 조정', description: '분석 범위를 조정합니다' },
  ],
  data_verification: [
    { id: 'confirm', label: '확인', description: '데이터가 정확합니다', recommended: true },
    { id: 'modify', label: '수정 요청', description: '일부 데이터 수정이 필요합니다' },
  ],
};

// 기본 데이터 소스 옵션
export const DEFAULT_DATA_SOURCE_OPTIONS: HitlOption[] = [
  {
    id: 'erp',
    label: '사내 ERP 시스템',
    description: '코나아이 ERP의 실시간 재무 데이터를 연동합니다.',
    icon: '🔌',
    recommended: true,
  },
  {
    id: 'upload',
    label: '수동 데이터 업로드',
    description: '엑셀 파일 또는 CSV를 직접 업로드합니다.',
    icon: '📤',
  },
  {
    id: 'sample',
    label: '샘플 데이터 사용',
    description: '데모용 샘플 데이터로 미리보기합니다.',
    icon: '📋',
  },
];

// 기본 ERP 연결 정보
export const DEFAULT_ERP_CONNECTIONS = [
  { name: '영림원 ERP', status: 'connected', lastSync: '2026-01-30 09:15' },
  { name: 'E2MAX MES', status: 'connected', lastSync: '2026-01-30 09:12' },
  { name: 'Platform Portal', status: 'connected', lastSync: '2026-01-30 08:45' },
  { name: '홈택스 연동', status: 'connected', lastSync: '2026-01-29 18:00' },
];

// 기본 할 일 목록 (심층 사고용) - deprecated, use SCENARIO_TODOS instead
export const DEFAULT_DEEP_THINKING_TODOS = [
  { id: '1', label: '데이터 소스 확인 및 연결', completed: false },
  { id: '2', label: 'ERP 재무 데이터 조회', completed: false },
  { id: '3', label: 'ERP 사업부별 실적 데이터 조회', completed: false },
  { id: '4', label: 'ERP 운영 KPI 데이터 조회', completed: false },
  { id: '5', label: '슬라이드 구성 및 스토리라인 설계', completed: false },
  { id: '6', label: '표지 슬라이드 제작', completed: false },
  { id: '7', label: '경영 하이라이트 슬라이드 제작', completed: false },
  { id: '8', label: '재무 실적 슬라이드 제작', completed: false },
  { id: '9', label: '사업부별 실적 슬라이드 제작', completed: false },
  { id: '10', label: '2026년 전망 및 전략 슬라이드 제작', completed: false },
];

// 시나리오 전체 Task 목록 (동적 Todo list용)
// 하나의 Task에 여러 도구(step)가 매핑될 수 있음
export interface ScenarioTodo {
  id: string;
  stepIds: string[]; // 여러 step id를 매핑
  label: string;
}

export const SCENARIO_TODOS: ScenarioTodo[] = [
  {
    id: '1',
    stepIds: ['tool_data_source', 'tool_erp_connect'],
    label: '데이터 소스 선택 및 연결',
  },
  {
    id: '2',
    stepIds: ['tool_parallel_query', 'tool_data_query_1', 'tool_data_query_2', 'tool_data_query_3', 'tool_data_query_4', 'tool_data_validation'],
    label: '재무 데이터 조회 및 검증',
  },
  {
    id: '3',
    stepIds: ['tool_ppt_setup'],
    label: 'PPT 세부 설정',
  },
  {
    id: '4',
    stepIds: ['tool_web_search'],
    label: '시장 정보 수집',
  },
  {
    id: '5',
    stepIds: ['tool_slide_planning'],
    label: '슬라이드 구성 계획',
  },
  {
    id: '6',
    stepIds: ['tool_slide_outline_review'],
    label: '슬라이드 개요 검토',
  },
  {
    id: '7',
    stepIds: ['tool_slide_generation'],
    label: '슬라이드 제작',
  },
];

// stepId가 속한 todo 찾기
export const findTodoByStepId = (stepId: string): ScenarioTodo | undefined => {
  return SCENARIO_TODOS.find(todo => todo.stepIds.includes(stepId));
};

// 완료된 단계들을 기반으로 todos 상태 계산
export const getScenarioTodosWithStatus = (
  currentStepId: string | null,
  completedStepIds: Set<string>
): Array<ScenarioTodo & { status: 'completed' | 'in_progress' | 'pending' }> => {
  return SCENARIO_TODOS.map(todo => {
    // 해당 Task의 모든 stepId가 완료되었는지 확인
    const allCompleted = todo.stepIds.every(stepId => completedStepIds.has(stepId));
    // 현재 진행 중인 stepId가 이 Task에 속하는지 확인
    const isInProgress = currentStepId !== null && todo.stepIds.includes(currentStepId);
    // 일부 stepId가 완료되었는지 확인 (진행 중 표시용)
    const someCompleted = todo.stepIds.some(stepId => completedStepIds.has(stepId));

    let status: 'completed' | 'in_progress' | 'pending' = 'pending';

    if (allCompleted) {
      status = 'completed';
    } else if (isInProgress || someCompleted) {
      status = 'in_progress';
    }

    return { ...todo, status };
  });
};

// 애니메이션 기본 시간
export const TOOL_ANIMATION_DURATION = 300; // ms
export const TOOL_STEP_DELAY = 800; // ms (각 도구 간 지연)

// =============================================
// 병렬 데이터 조회 관련 상수
// =============================================

// 병렬 조회 쿼리 목록
export const PARALLEL_DATA_QUERIES: ParallelDataQuery[] = [
  { id: 'q1', source: '영림원', query: '손익계산서', period: 'Q4 2025', status: 'pending' },
  { id: 'q2', source: '영림원', query: '재무상태표', period: 'Q4 2025', status: 'pending' },
  { id: 'q3', source: '영림원', query: '사업부별 손익', period: 'Q4 2025', status: 'pending' },
  { id: 'q4', source: 'E2MAX', query: '생산/물류 KPI', period: 'Q4 2025', status: 'pending' },
  { id: 'q5', source: 'Platform Portal', query: '고객/매출 분석', period: 'Q4 2025', status: 'pending' },
];

// 개별 조회 결과 데이터
export const DATA_QUERY_RESULTS: Record<string, DataQueryResult> = {
  // 손익계산서 조회 결과
  income_statement: {
    id: 'income_statement',
    source: '영림원 ERP',
    queryName: '손익계산서',
    period: '2025년 4분기 (10월~12월)',
    timestamp: '2026-01-30 09:32:15',
    data: [
      { label: '매출액', current: '125,847백만', previous: '112,058백만', change: '+12.3%' },
      { label: '매출원가', current: '62,924백만', previous: '57,149백만', change: '+10.1%' },
      { label: '매출총이익', current: '62,923백만', previous: '54,909백만', change: '+14.6%' },
      { label: '판매비와관리비', current: '44,047백만', previous: '39,220백만', change: '+12.3%' },
      { label: '영업이익', current: '18,876백만', previous: '15,689백만', change: '+20.3%' },
      { label: '당기순이익', current: '14,440백만', previous: '11,807백만', change: '+22.3%' },
    ],
    sparqlQuery: `PREFIX erp: <http://erp.konai.com/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?account ?currentAmount ?previousAmount ?changeRate
FROM <http://erp.konai.com/financial/2025/Q4>
WHERE {
  ?statement a erp:IncomeStatement ;
             erp:fiscalPeriod "2025-Q4"^^xsd:string ;
             erp:accountName ?account ;
             erp:amount ?currentAmount .

  OPTIONAL {
    ?prevStatement a erp:IncomeStatement ;
                   erp:fiscalPeriod "2024-Q4"^^xsd:string ;
                   erp:accountName ?account ;
                   erp:amount ?previousAmount .
  }

  BIND((?currentAmount - ?previousAmount) / ?previousAmount * 100 AS ?changeRate)
}
ORDER BY DESC(?currentAmount)`,
  },
  // 사업부별 손익 조회 결과
  division_performance: {
    id: 'division_performance',
    source: '영림원 ERP',
    queryName: '사업부별 손익',
    period: '2025년 4분기 (10월~12월)',
    timestamp: '2026-01-30 09:32:18',
    data: [
      { label: '플랫폼사업', current: '75,508백만', previous: '60.0%', change: '+18%' },
      { label: '솔루션사업', current: '31,462백만', previous: '25.0%', change: '+8%' },
      { label: '컨설팅사업', current: '18,877백만', previous: '15.0%', change: '+5%' },
    ],
    sparqlQuery: `PREFIX erp: <http://erp.konai.com/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?divisionName ?revenue ?revenueRatio ?operatingProfit ?profitMargin ?yoyGrowth
FROM <http://erp.konai.com/management/2025/Q4>
WHERE {
  ?division a erp:BusinessDivision ;
            erp:name ?divisionName ;
            erp:revenue ?revenue ;
            erp:revenueRatio ?revenueRatio ;
            erp:operatingProfit ?operatingProfit ;
            erp:profitMargin ?profitMargin ;
            erp:yoyGrowth ?yoyGrowth .

  FILTER(?division IN (erp:PlatformDiv, erp:SolutionDiv, erp:ConsultingDiv))
}
ORDER BY DESC(?revenue)`,
  },
  // 생산/물류 KPI 조회 결과
  production_kpi: {
    id: 'production_kpi',
    source: 'E2MAX MES',
    queryName: '생산/물류 핵심 KPI',
    period: '2025년 4분기 (10월~12월)',
    timestamp: '2026-01-30 09:32:21',
    data: [
      { label: '생산 완료율', current: '98.2%', previous: '97.0%', change: '101.2%' },
      { label: '적시 납품률 (OTD)', current: '96.5%', previous: '95.0%', change: '101.6%' },
      { label: '불량률', current: '0.8%', previous: '1.0%', change: '125.0%' },
      { label: '설비 가동률 (OEE)', current: '87.3%', previous: '85.0%', change: '102.7%' },
      { label: '재고 회전율', current: '12.4회', previous: '11.0회', change: '112.7%' },
    ],
    sparqlQuery: `PREFIX mes: <http://mes.e2max.com/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?kpiName ?actualValue ?targetValue ?achievementRate
FROM <http://mes.e2max.com/production/2025/Q4>
WHERE {
  ?kpi a mes:ProductionKPI ;
       mes:name ?kpiName ;
       mes:actualValue ?actualValue ;
       mes:targetValue ?targetValue ;
       mes:period "2025-Q4"^^xsd:string .

  BIND(?actualValue / ?targetValue * 100 AS ?achievementRate)

  FILTER(?kpi IN (
    mes:ProductionCompletionRate,
    mes:OnTimeDelivery,
    mes:DefectRate,
    mes:OEE,
    mes:InventoryTurnover
  ))
}
ORDER BY ?kpiName`,
  },
  // 고객/매출 분석 조회 결과
  customer_analysis: {
    id: 'customer_analysis',
    source: 'Platform Portal',
    queryName: '고객/매출 분석',
    period: '2025년 4분기 (10월~12월)',
    timestamp: '2026-01-30 09:32:24',
    data: [
      { label: '총 고객 수', current: '847', previous: '802', change: '+5.6%' },
      { label: '신규 고객', current: '52', previous: '45', change: '+15.6%' },
      { label: '이탈 고객', current: '7', previous: '9', change: '-22.2%' },
      { label: '고객 유지율', current: '94.2%', previous: '93.5%', change: '+0.7%p' },
      { label: 'NPS (순추천지수)', current: '72', previous: '68', change: '+4' },
    ],
    sparqlQuery: `PREFIX portal: <http://portal.konai.com/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT ?metricName ?currentValue ?previousValue ?changeRate
FROM <http://portal.konai.com/customer/2025/Q4>
WHERE {
  ?metric a portal:CustomerMetric ;
          portal:name ?metricName ;
          portal:value ?currentValue ;
          portal:period "2025-Q4"^^xsd:string .

  OPTIONAL {
    ?prevMetric a portal:CustomerMetric ;
                portal:name ?metricName ;
                portal:value ?previousValue ;
                portal:period "2025-Q3"^^xsd:string .
  }

  BIND((?currentValue - ?previousValue) / ?previousValue * 100 AS ?changeRate)

  FILTER(?metric IN (
    portal:TotalCustomers,
    portal:NewCustomers,
    portal:ChurnedCustomers,
    portal:RetentionRate,
    portal:NPS
  ))
}`,
  },
};

// =============================================
// Chain-of-Thought 분석 데이터 (deep_thinking용)
// =============================================

// 분석 데이터 타입
export interface QueryAnalysisKeyword {
  keyword: string;
  category: string;
  description: string;
}

export interface QueryAnalysisComplexity {
  dataSource: string;
  analysisDepth: string;
  estimatedSlides: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
}

export interface QueryAnalysis {
  userQuery: string;
  keywords: QueryAnalysisKeyword[];
  implicitRequirements: string[];
  complexity: QueryAnalysisComplexity;
  conclusion: string;
}

// PPT 시나리오용 Chain-of-Thought 분석 데이터
export const PPT_QUERY_ANALYSIS: QueryAnalysis = {
  userQuery: 'Q4 2025 경영 실적 보고서 PPT를 만들어주세요.',
  keywords: [
    { keyword: 'Q4 2025', category: '기간', description: '2025년 4분기 (10월~12월)' },
    { keyword: '경영 실적', category: '유형', description: '재무/운영 성과 보고' },
    { keyword: '보고서', category: '목적', description: '경영진/이사회 보고용' },
    { keyword: 'PPT', category: '산출물', description: '프레젠테이션 파일' },
  ],
  implicitRequirements: [
    '데이터 정확성 필수 (경영 보고 목적)',
    '시각화 필요 (차트, 그래프)',
    '비교 분석 포함 (전년 동기, 전분기 대비)',
    '전문적 디자인 (공식 보고용)',
  ],
  complexity: {
    dataSource: '다중 시스템 연동 필요',
    analysisDepth: '재무 + 운영 + 시장 환경',
    estimatedSlides: '8~12장',
    level: 4,
    levelLabel: 'High',
  },
  conclusion: '체계적 작업 분해 필요, 5단계 Task로 구성',
};

// =============================================
// 슬라이드 파일 생성 (slide_planning 도구용)
// =============================================

export interface SlideFile {
  id: number;
  filename: string;
  title: string;
}

export const PPT_SLIDE_FILES: SlideFile[] = [
  { id: 0, filename: '00_metadata.md', title: '메타데이터' },
  { id: 1, filename: '01_cover.md', title: '표지' },
  { id: 2, filename: '02_executive_summary.md', title: 'Executive Summary' },
  { id: 3, filename: '03_financial_highlights.md', title: '재무 하이라이트' },
  { id: 4, filename: '04_division_performance.md', title: '사업부별 실적' },
  { id: 5, filename: '05_operation_kpi.md', title: '운영 KPI' },
  { id: 6, filename: '06_market_outlook.md', title: '시장 전망' },
];

// =============================================
// 슬라이드 개요 상세 콘텐츠 (마크다운 형식)
// =============================================

export const SLIDE_OUTLINE_CONTENTS: Record<string, string> = {
  '00_metadata.md': `# 프레젠테이션 메타정보

## 기본 정보
- **제목**: Q4 2025 경영 실적 보고서
- **부제**: 코나아이 분기 경영 현황
- **대상 청중**: 경영진/이사회
- **톤앤매너**: 데이터 중심, 전문적
- **총 슬라이드 수**: 7장
- **언어**: 한국어

## 슬라이드 구성
1. 표지
2. Executive Summary
3. 재무 하이라이트
4. 사업부별 실적
5. 운영 KPI
6. 시장 전망

## 데이터 소스
- 영림원 ERP (재무/회계)
- E2MAX MES (생산/물류)
- Platform Portal (고객/매출)
- 데이터 기준일: 2025-12-31

## 참고 자료 출처
- 내부 ERP 시스템 실적 데이터
- MES 운영 KPI 대시보드
- 고객 관리 포털 분석 리포트
`,

  '01_cover.md': `# 슬라이드 1: 표지

## 레이아웃
- **타입**: 타이틀 슬라이드
- **배경**: Corporate Blue 그라데이션

## 콘텐츠

### 메인 타이틀
\`\`\`
Q4 2025 경영 실적 보고서
\`\`\`

### 서브 타이틀
\`\`\`
코나아이 분기 경영 현황
\`\`\`

### 하단 정보
- 발표일: 2026년 1월 30일
- 발표자: 경영전략실
- 소속: 코나아이 주식회사

## 비주얼 요소
- 코나아이 로고 (우측 상단)
- 분기 강조 아이콘 (Q4)
- 클린하고 전문적인 배경

## 디자인 노트
- 제목은 크고 bold하게 (40pt+)
- 로고는 적절한 크기로 배치
- 발표일과 발표자 정보는 하단에 작게
- 전체적으로 절제된 기업 이미지 전달
`,

  '02_executive_summary.md': `# 슬라이드 2: Executive Summary

## 레이아웃
- **타입**: 핵심 요약 (KPI 카드)
- **배경**: 라이트

## 콘텐츠

### 제목
\`\`\`
Executive Summary
\`\`\`

### 핵심 메시지
\`\`\`
"Q4 2025, 전년 동기 대비 두 자릿수 성장 달성"
\`\`\`

### 주요 성과 KPI

| 지표 | 실적 | 전년비 |
|------|------|--------|
| **매출액** | 1,258억원 | +12.3% |
| **영업이익** | 189억원 | +20.3% |
| **당기순이익** | 144억원 | +22.3% |
| **영업이익률** | 15.0% | +1.0%p |

### 분기 하이라이트
- 플랫폼사업 성장 주도 (YoY +18%)
- 고부가 제품 믹스 개선으로 수익성 강화
- 신규 고객 52개사 확보, 고객 유지율 94.2%

### Key Takeaways
\`\`\`
1. 매출 +12.3% 성장 - 분기 최고 실적 경신
2. 영업이익률 15% 돌파 - 원가 혁신 효과
3. 신규 고객 확대 + 기존 고객 유지 = 안정적 성장 기반
\`\`\`

## 비주얼 요소
- 큰 숫자 강조 KPI 카드 (4개)
- 상승 화살표 아이콘
- Accent 컬러로 성장률 강조

## 디자인 노트
- 핵심 수치는 매우 크게 (60pt+)
- 긍정적 지표는 Emerald 색상
- 한 눈에 분기 성과 파악 가능하도록
- 숫자와 비율은 Bold 처리
`,

  '03_financial_highlights.md': `# 슬라이드 3: 재무 하이라이트

## 레이아웃
- **타입**: 데이터 테이블 + 차트
- **배경**: 라이트

## 콘텐츠

### 제목
\`\`\`
재무 하이라이트
\`\`\`

### 핵심 메시지
\`\`\`
"수익성 중심 성장, 영업이익률 15% 돌파"
\`\`\`

### 손익계산서 요약

| 계정과목 | Q4 2025 | Q4 2024 | 증감 |
|---------|---------|---------|------|
| 매출액 | 125,847백만 | 112,058백만 | **+12.3%** |
| 매출원가 | 62,924백만 | 57,149백만 | +10.1% |
| 매출총이익 | 62,923백만 | 54,909백만 | **+14.6%** |
| 판관비 | 44,047백만 | 39,220백만 | +12.3% |
| 영업이익 | 18,876백만 | 15,689백만 | **+20.3%** |
| 당기순이익 | 14,440백만 | 11,807백만 | **+22.3%** |

### 수익성 지표

\`\`\`
매출총이익률    영업이익률    순이익률
   50.0%         15.0%        11.5%
  (+1.2%p)      (+1.0%p)     (+0.9%p)
\`\`\`

### 인사이트
- **원가율 개선**: 50.0% → 49.0% (자동화 투자 효과)
- **판관비율 안정적 유지**: 35.0%
- **금융수익 증가**로 순이익률 추가 개선

### 재무건전성
\`\`\`
부채비율: 42.3% (전년 45.1%)
유동비율: 187.5% (안정적)
\`\`\`

## 비주얼 요소
- 손익계산서 워터폴 차트
- 수익성 지표 게이지 차트
- 전년비 증감 화살표

## 디자인 노트
- 핵심 증감률 Bold + Accent 컬러
- 테이블은 간결하게, 중요 행 하이라이트
- 차트와 테이블 균형 있게 배치
- 양수 증감은 녹색, 음수는 적색
`,

  '04_division_performance.md': `# 슬라이드 4: 사업부별 실적

## 레이아웃
- **타입**: 비교 차트 + 카드
- **배경**: 라이트

## 콘텐츠

### 제목
\`\`\`
사업부별 실적
\`\`\`

### 핵심 메시지
\`\`\`
"플랫폼사업이 성장을 주도, 전 사업부 흑자 달성"
\`\`\`

### 사업부별 매출 현황

| 사업부 | 매출액 | 비중 | YoY 성장률 |
|--------|--------|------|-----------|
| **플랫폼사업** | 755억원 | 60% | **+18%** |
| 솔루션사업 | 315억원 | 25% | +8% |
| 컨설팅사업 | 189억원 | 15% | +5% |
| **합계** | **1,258억원** | 100% | **+12.3%** |

### 사업부별 특이사항

#### 플랫폼사업 (+18%)
- 신규 대형 고객사 3개 확보 (금융권)
- 메탈카드 제품 믹스 확대 (12%→18%)
- 해외 수출 물량 증가 (동남아 시장)

#### 솔루션사업 (+8%)
- 공공부문 수주 증가
- SI 프로젝트 마진율 개선 (21%→24%)
- 신규 솔루션 런칭 2건 (AI 기반)

#### 컨설팅사업 (+5%)
- DX 컨설팅 수요 지속
- 컨설턴트 활용률 85% 유지
- 대형 프로젝트 1건 완료

### 성장 동력 분석
\`\`\`
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  플랫폼     │   │  솔루션     │   │  컨설팅     │
│  핵심 성장  │ → │  안정 성장  │ → │  기반 확보  │
│  +18%       │   │  +8%        │   │  +5%        │
└─────────────┘   └─────────────┘   └─────────────┘
\`\`\`

## 비주얼 요소
- 파이 차트 (사업부 비중)
- 막대 차트 (성장률 비교)
- 사업부별 아이콘

## 디자인 노트
- 플랫폼사업 강조 (주 성장 동력)
- 비중과 성장률 동시 표현
- 각 사업부 색상 구분 (Blue/Green/Gray)
- 트렌드 화살표로 방향성 표시
`,

  '05_operation_kpi.md': `# 슬라이드 5: 운영 KPI

## 레이아웃
- **타입**: KPI 대시보드
- **배경**: 라이트

## 콘텐츠

### 제목
\`\`\`
운영 KPI
\`\`\`

### 핵심 메시지
\`\`\`
"운영 효율성 전 지표 목표 달성, 품질 경쟁력 강화"
\`\`\`

### 생산/물류 KPI (E2MAX MES)

| KPI | 실적 | 목표 | 달성률 |
|-----|------|------|--------|
| 생산 완료율 | 98.2% | 97.0% | **101.2%** |
| 적시 납품률 (OTD) | 96.5% | 95.0% | **101.6%** |
| 불량률 | 0.8% | 1.0% | **125.0%** |
| 설비 가동률 (OEE) | 87.3% | 85.0% | **102.7%** |
| 재고 회전율 | 12.4회 | 11.0회 | **112.7%** |

### 고객/매출 KPI (Platform Portal)

| KPI | Q4 2025 | Q3 2025 | 증감 |
|-----|---------|---------|------|
| 총 고객 수 | 847 | 802 | **+5.6%** |
| 신규 고객 | 52 | 45 | **+15.6%** |
| 이탈 고객 | 7 | 9 | **-22.2%** |
| 고객 유지율 | 94.2% | 93.5% | **+0.7%p** |
| NPS | 72 | 68 | **+4** |

### 운영 하이라이트
\`\`\`
✓ 품질 개선: 불량률 0.8% (전년 1.0%)
✓ 고객 만족도 상승: NPS 72점 달성
✓ 신규 고객 확보 가속화: 52개사
✓ 설비 효율 최적화: OEE 87.3%
\`\`\`

### 개선 포인트
\`\`\`
△ 재고 회전일 관리 필요 (32일 → 29일 목표)
△ 설비 예방정비 강화 (가동률 90% 목표)
\`\`\`

## 비주얼 요소
- KPI 게이지 차트 (목표 대비 달성률)
- 추이 그래프 (분기별 비교)
- 체크마크 아이콘 (달성 지표)
- 경고 아이콘 (개선 필요 지표)

## 디자인 노트
- 달성률 100% 이상은 녹색
- 미달 지표는 주황색 경고
- 핵심 KPI는 크게 강조
- 대시보드 스타일로 구성
`,

  '06_market_outlook.md': `# 슬라이드 6: 시장 전망

## 레이아웃
- **타입**: 전략/로드맵
- **배경**: 라이트 또는 약간의 그라데이션

## 콘텐츠

### 제목
\`\`\`
시장 전망 및 2026년 전략
\`\`\`

### 핵심 메시지
\`\`\`
"디지털 결제 시장 성장세 지속, 선제적 투자로 시장 선도"
\`\`\`

### 시장 환경 분석

#### 긍정적 요인 (Opportunities)
- 디지털 결제 시장 연평균 15% 성장 전망
- 메탈카드/프리미엄 제품 수요 지속 증가
- B2B 플랫폼 솔루션 수요 확대
- AI/DX 투자 확대 추세

#### 주의 요인 (Risks)
- 환율 변동성 확대 (원자재 수입 비용)
- 경쟁 심화 (글로벌 플레이어 진입)
- 인건비 상승 압박
- 반도체/소재 공급망 불확실성

### 2026년 전략 방향

\`\`\`
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  성장       │   │  수익성     │   │  혁신       │
│  플랫폼사업 │ + │  원가 혁신  │ + │  신사업     │
│  확대       │   │  지속       │   │  발굴       │
└─────────────┘   └─────────────┘   └─────────────┘
\`\`\`

### 핵심 실행 과제

| 분기 | 과제 |
|------|------|
| Q1 | 플랫폼사업 해외 진출 (동남아 3개국) |
| Q2 | 스마트 팩토리 2단계 투자 (자동화 확대) |
| Q3 | 신규 SaaS 솔루션 런칭 (구독형 서비스) |
| Q4 | M&A 검토 (기술 스타트업 인수 추진) |

### 2026년 목표

| 지표 | 2025 실적 | 2026 목표 | 성장률 |
|------|----------|----------|--------|
| 매출액 | 4,500억 | 5,200억 | **+15.6%** |
| 영업이익률 | 14.5% | 15.5% | **+1.0%p** |
| 해외매출비중 | 8% | 12% | **+4%p** |

### 성공을 위한 핵심 질문
\`\`\`
1. 플랫폼 사업 해외 진출 속도는 적정한가?
2. 원가 혁신 로드맵이 현실적인가?
3. 신사업 투자 재원은 확보되었는가?
4. 핵심 인재 확보 전략은 수립되었는가?
\`\`\`

## 비주얼 요소
- 전략 방향 3개 블록 다이어그램
- 로드맵 타임라인 (분기별)
- 목표 달성 화살표
- SWOT 또는 환경 분석 매트릭스

## 디자인 노트
- 미래 지향적 비주얼
- 액션 아이템은 타임라인 형태
- 목표 수치 강조 (Accent 컬러)
- 긍정/부정 요인 색상 구분
- 전략과 실행 과제의 연결성 표현
`,
};
