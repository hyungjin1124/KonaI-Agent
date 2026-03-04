import { AgentDefinition, SimulationScenario } from './types';

// =============================================
// Agent Definitions
// =============================================

export const AGENT_DEFINITIONS: Record<string, AgentDefinition> = {
  data_collector: {
    id: 'data_collector',
    name: '데이터 수집 에이전트',
    role: '데이터 소스 탐색 및 수집 전문가',
    icon: '📊',
    color: 'blue',
  },
  analyst: {
    id: 'analyst',
    name: '분석 에이전트',
    role: '데이터 분석 및 인사이트 도출 전문가',
    icon: '🔬',
    color: 'purple',
  },
  visualizer: {
    id: 'visualizer',
    name: '시각화 에이전트',
    role: '차트 및 대시보드 시각화 전문가',
    icon: '📈',
    color: 'emerald',
  },
  reporter: {
    id: 'reporter',
    name: '보고서 에이전트',
    role: '보고서 작성 및 요약 전문가',
    icon: '📝',
    color: 'amber',
  },
};

// =============================================
// Simulation Scenarios
// =============================================

export const MULTI_AGENT_SCENARIOS: Record<string, SimulationScenario> = {
  sales_analysis: {
    id: 'sales_analysis',
    name: '매출 분석 멀티 에이전트',
    description: '4개 에이전트가 협업하여 종합 매출 분석 보고서를 생성합니다.',
    agents: [
      AGENT_DEFINITIONS.data_collector,
      AGENT_DEFINITIONS.analyst,
      AGENT_DEFINITIONS.visualizer,
      AGENT_DEFINITIONS.reporter,
    ],
    steps: [
      // Phase 1: 데이터 수집 (data_collector 단독)
      { agentId: 'data_collector', delayMs: 800, action: 'ERP 시스템 연결 중...', toolName: 'erp_connect' },
      { agentId: 'data_collector', delayMs: 1200, action: '매출 데이터 조회 중...', toolName: 'query_revenue', toolOutput: 'Q4 매출 데이터 2,847건 수집 완료' },
      { agentId: 'data_collector', delayMs: 1000, action: '비용 데이터 조회 중...', toolName: 'query_costs', toolOutput: '비용 데이터 1,523건 수집 완료' },

      // Phase 2: 분석 에이전트 시작 (data_collector → analyst 핸드오프, 동시에 data_collector 계속)
      { agentId: 'data_collector', delayMs: 600, action: '고객 데이터 조회 중...', toolName: 'query_customers', handoffTo: 'analyst', handoffReason: '매출/비용 데이터 수집 완료, 분석 시작' },
      { agentId: 'analyst', delayMs: 1500, action: '매출 트렌드 분석 중...', toolName: 'trend_analysis', toolOutput: 'Q4 매출 전년 대비 12.3% 증가' },
      { agentId: 'data_collector', delayMs: 800, action: '시장 데이터 수집 중...', toolName: 'query_market', toolOutput: '시장 데이터 수집 완료' },
      { agentId: 'analyst', delayMs: 1200, action: '수익성 분석 중...', toolName: 'profitability_analysis', toolOutput: '영업이익률 8.7% → 9.2% 개선' },

      // Phase 3: data_collector 완료, 시각화 시작
      {
        agentId: 'data_collector', delayMs: 500, action: '데이터 수집 완료', isFinal: true,
        result: { summary: 'ERP, 고객, 시장 데이터 총 5,892건 수집', artifacts: ['revenue_data.csv', 'cost_data.csv', 'market_data.csv'] },
      },
      { agentId: 'analyst', delayMs: 1000, action: '이상 징후 탐지 중...', toolName: 'anomaly_detection', toolOutput: '해외사업부 Q4 매출 급감 탐지', handoffTo: 'visualizer', handoffReason: '분석 중간 결과 전달, 시각화 시작' },

      // Phase 4: 시각화 시작 (analyst와 병렬)
      { agentId: 'visualizer', delayMs: 1000, action: '매출 트렌드 차트 생성 중...', toolName: 'create_chart', toolOutput: '매출 트렌드 라인 차트 생성' },
      { agentId: 'analyst', delayMs: 1500, action: '핵심 인사이트 도출 중...', toolName: 'insight_generation', toolOutput: '5개 핵심 인사이트 도출 완료' },
      { agentId: 'visualizer', delayMs: 800, action: '사업부별 비교 차트 생성 중...', toolName: 'create_comparison', toolOutput: '사업부별 비교 바 차트 생성' },
      {
        agentId: 'analyst', delayMs: 500, action: '분석 완료', isFinal: true,
        result: { summary: '매출 12.3% 증가, 영업이익률 0.5%p 개선, 해외사업부 주의 필요', artifacts: ['analysis_report.md'] },
        handoffTo: 'reporter', handoffReason: '분석 완료, 보고서 작성 시작',
      },

      // Phase 5: 시각화 + 보고서 병렬
      { agentId: 'visualizer', delayMs: 1200, action: 'KPI 대시보드 구성 중...', toolName: 'create_dashboard', toolOutput: 'KPI 대시보드 위젯 4개 구성' },
      { agentId: 'reporter', delayMs: 1000, action: '보고서 구조 설계 중...', toolName: 'plan_report' },
      {
        agentId: 'visualizer', delayMs: 500, action: '시각화 완료', isFinal: true,
        result: { summary: '3개 차트 + KPI 대시보드 생성', artifacts: ['trend_chart.png', 'comparison_chart.png', 'kpi_dashboard.html'] },
      },
      { agentId: 'reporter', delayMs: 1500, action: '보고서 본문 작성 중...', toolName: 'write_report', toolOutput: '보고서 본문 12페이지 작성' },
      { agentId: 'reporter', delayMs: 800, action: '경영진 요약 작성 중...', toolName: 'write_summary', toolOutput: 'Executive Summary 작성 완료' },
      {
        agentId: 'reporter', delayMs: 500, action: '보고서 완성', isFinal: true,
        result: { summary: '종합 매출 분석 보고서 12페이지 완성', artifacts: ['sales_report.pdf', 'executive_summary.md'] },
      },
    ],
  },
};

export const DEFAULT_SCENARIO_ID = 'sales_analysis';

// =============================================
// Status Labels & Colors
// =============================================

export const STATUS_CONFIG = {
  pending: { label: '대기 중', badgeClass: 'bg-gray-100 text-gray-600' },
  running: { label: '실행 중', badgeClass: 'bg-blue-100 text-blue-700' },
  completed: { label: '완료', badgeClass: 'bg-green-100 text-green-700' },
  failed: { label: '실패', badgeClass: 'bg-red-100 text-red-700' },
} as const;
