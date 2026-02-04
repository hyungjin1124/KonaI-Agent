import { ToolType, ToolMetadata, HitlOption, ParallelDataQuery, DataQueryResult } from '../../types';
import { PPTConfig } from '../../../../../types';

// =============================================
// PPT Setup Step 정의 (3단계 Wizard UI)
// =============================================

export type PPTSetupStepId = 'design' | 'content' | 'confirm';

export interface PPTSetupStep {
  id: PPTSetupStepId;
  title: string;
  description: string;
}

export const PPT_SETUP_STEPS: PPTSetupStep[] = [
  { id: 'design', title: '디자인 설정', description: '테마와 폰트를 선택해 주세요.' },
  { id: 'content', title: '콘텐츠 설정', description: '포함할 내용과 슬라이드 수를 설정해 주세요.' },
  { id: 'confirm', title: '설정 확인', description: '선택한 설정을 확인하고 생성을 시작합니다.' },
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
};

// HITL 도구 목록
export const HITL_TOOLS: ToolType[] = [
  'data_source_select',
  'data_validation',
  'ppt_setup',
];

// 도구가 HITL인지 확인하는 헬퍼
export const isHitlTool = (toolType: ToolType): boolean => {
  return HITL_TOOLS.includes(toolType);
};

// HITL 질문 (수정 3: 플로팅 패널용)
export const HITL_QUESTIONS: Partial<Record<ToolType, string>> = {
  data_source_select: '경영 실적 보고서 제작을 위해 데이터 소스를 선택해 주세요.',
  data_validation: 'ERP에서 조회한 Q4 2025 핵심 데이터를 확인해 주세요.',
  ppt_setup: 'PPT 세부 설정을 확인해 주세요.',
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
    stepIds: ['tool_slide_planning', 'tool_slide_generation'],
    label: '슬라이드 구성 및 제작',
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
