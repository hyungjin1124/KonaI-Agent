/**
 * Feedback & Quality Management — Types & Mock Data
 *
 * Admin quality dashboard with KPI summaries, feedback list, and quality trends.
 */

// --- Types ---

export type FeedbackType = 'positive' | 'negative';
export type FeedbackStatus = 'reviewed' | 'pending' | 'resolved';
export type PeriodFilter = '7d' | '30d' | '90d';
export type FeedbackFilter = 'all' | 'positive' | 'negative';

export interface FeedbackItem {
  id: string;
  date: string;
  userName: string;
  agentName: string;
  responseSummary: string;
  feedbackType: FeedbackType;
  comment?: string;
  status: FeedbackStatus;
}

export interface QualityKPI {
  satisfactionRate: number; // percentage
  goodQualityRate: number; // percentage
  totalFeedback: number;
  unresolvedRate: number; // percentage
  satisfactionChange: string;
  qualityChange: string;
  feedbackChange: string;
  unresolvedChange: string;
}

export interface DailyQualityData {
  date: string;
  satisfaction: number; // percentage
  positive: number;
  negative: number;
}

// --- Helpers ---

export function filterFeedback(
  items: FeedbackItem[],
  feedbackFilter: FeedbackFilter,
  search: string,
): FeedbackItem[] {
  return items.filter(item => {
    const matchesType = feedbackFilter === 'all' || item.feedbackType === feedbackFilter;
    const matchesSearch = !search ||
      item.userName.toLowerCase().includes(search.toLowerCase()) ||
      item.responseSummary.toLowerCase().includes(search.toLowerCase()) ||
      (item.comment && item.comment.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });
}

// --- Constants ---

export const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: '7d', label: '7일' },
  { value: '30d', label: '30일' },
  { value: '90d', label: '90일' },
];

export const FEEDBACK_FILTER_OPTIONS: { value: FeedbackFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'positive', label: '긍정' },
  { value: 'negative', label: '부정' },
];

// --- Mock Data ---

export const QUALITY_KPI: QualityKPI = {
  satisfactionRate: 87.3,
  goodQualityRate: 91.2,
  totalFeedback: 1248,
  unresolvedRate: 4.8,
  satisfactionChange: '+2.1%',
  qualityChange: '+1.5%',
  feedbackChange: '+156',
  unresolvedChange: '-0.7%',
};

export const MOCK_FEEDBACK: FeedbackItem[] = [
  { id: 'fb-1', date: '2026-03-11', userName: '홍길동', agentName: 'KonaI Assistant', responseSummary: '2026년 1분기 매출 데이터 분석 결과를 정확히 제공', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-2', date: '2026-03-11', userName: '김철수', agentName: 'KonaI Assistant', responseSummary: '재무제표 요약이 최신 데이터와 일치하지 않음', feedbackType: 'negative', comment: '3월 데이터가 반영되지 않았습니다.', status: 'pending' },
  { id: 'fb-3', date: '2026-03-10', userName: '이영희', agentName: 'Data Analyst', responseSummary: '부서별 인력 현황 차트 생성', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-4', date: '2026-03-10', userName: '박민수', agentName: 'KonaI Assistant', responseSummary: '계약서 검토 요청에 대한 법률 검토 의견 제공', feedbackType: 'positive', comment: '법무팀 확인 후에도 정확했습니다.', status: 'reviewed' },
  { id: 'fb-5', date: '2026-03-10', userName: '최지은', agentName: 'KonaI Assistant', responseSummary: '프로젝트 일정 관련 질문에 불완전한 답변', feedbackType: 'negative', comment: '일부 마일스톤이 누락되었습니다.', status: 'resolved' },
  { id: 'fb-6', date: '2026-03-09', userName: '정대현', agentName: 'Data Analyst', responseSummary: 'DID 사업부 월별 매출 추이 분석', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-7', date: '2026-03-09', userName: '한소영', agentName: 'KonaI Assistant', responseSummary: '고객 불만 분류 자동화 결과 검토', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-8', date: '2026-03-09', userName: '홍길동', agentName: 'KonaI Assistant', responseSummary: '경쟁사 분석 리포트 요약이 편향적', feedbackType: 'negative', comment: '특정 경쟁사 정보가 누락되어 있었습니다.', status: 'pending' },
  { id: 'fb-9', date: '2026-03-08', userName: '김철수', agentName: 'Data Analyst', responseSummary: '실시간 대시보드 위젯 데이터 정확성 확인', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-10', date: '2026-03-08', userName: '이영희', agentName: 'KonaI Assistant', responseSummary: '연차 규정 질문에 대한 정확한 답변', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-11', date: '2026-03-08', userName: '박민수', agentName: 'KonaI Assistant', responseSummary: 'API 문서 참조 링크가 깨져 있음', feedbackType: 'negative', comment: '링크가 404 에러를 반환합니다.', status: 'resolved' },
  { id: 'fb-12', date: '2026-03-07', userName: '최지은', agentName: 'Data Analyst', responseSummary: '월간 보고서 자동 생성 기능 사용', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-13', date: '2026-03-07', userName: '정대현', agentName: 'KonaI Assistant', responseSummary: '내부 교육 일정 안내', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-14', date: '2026-03-07', userName: '한소영', agentName: 'KonaI Assistant', responseSummary: '보안 점검 체크리스트 자동 생성', feedbackType: 'positive', comment: '매우 유용했습니다. 정기 점검에 활용 중입니다.', status: 'reviewed' },
  { id: 'fb-15', date: '2026-03-06', userName: '홍길동', agentName: 'KonaI Assistant', responseSummary: '신규 프로젝트 제안서 초안 작성 지원', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-16', date: '2026-03-06', userName: '김철수', agentName: 'Data Analyst', responseSummary: '데이터 파이프라인 모니터링 상태 확인', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-17', date: '2026-03-06', userName: '이영희', agentName: 'KonaI Assistant', responseSummary: '고객 FAQ 답변이 구버전 기준', feedbackType: 'negative', comment: 'v2.3 기준 답변이 필요했는데 v2.1 기준으로 답변했습니다.', status: 'pending' },
  { id: 'fb-18', date: '2026-03-05', userName: '박민수', agentName: 'KonaI Assistant', responseSummary: '회의록 자동 요약 및 액션 아이템 추출', feedbackType: 'positive', comment: '핵심 포인트를 잘 잡았습니다.', status: 'reviewed' },
  { id: 'fb-19', date: '2026-03-05', userName: '최지은', agentName: 'Data Analyst', responseSummary: '재무 데이터 시각화 차트 생성', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-20', date: '2026-03-05', userName: '정대현', agentName: 'KonaI Assistant', responseSummary: '인사 규정 관련 질문에 부정확한 답변', feedbackType: 'negative', comment: '최신 개정안이 반영되지 않았습니다.', status: 'pending' },
  { id: 'fb-21', date: '2026-03-04', userName: '한소영', agentName: 'KonaI Assistant', responseSummary: '시스템 장애 보고서 자동 생성', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-22', date: '2026-03-04', userName: '홍길동', agentName: 'Data Analyst', responseSummary: 'KPI 대시보드 데이터 검증', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-23', date: '2026-03-03', userName: '김철수', agentName: 'KonaI Assistant', responseSummary: '이메일 초안 작성 지원', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-24', date: '2026-03-03', userName: '이영희', agentName: 'KonaI Assistant', responseSummary: '예산 집행 현황 조회', feedbackType: 'positive', status: 'reviewed' },
  { id: 'fb-25', date: '2026-03-02', userName: '박민수', agentName: 'KonaI Assistant', responseSummary: '제품 릴리즈 노트 초안 검토', feedbackType: 'negative', comment: '일부 기능 변경사항이 빠져있었습니다.', status: 'resolved' },
];

// Daily quality trend data (last 30 days sample)
export const DAILY_QUALITY_DATA: DailyQualityData[] = [
  { date: '02/10', satisfaction: 82, positive: 28, negative: 6 },
  { date: '02/11', satisfaction: 85, positive: 31, negative: 5 },
  { date: '02/12', satisfaction: 84, positive: 26, negative: 5 },
  { date: '02/13', satisfaction: 88, positive: 35, negative: 5 },
  { date: '02/14', satisfaction: 86, positive: 30, negative: 5 },
  { date: '02/15', satisfaction: 83, positive: 25, negative: 5 },
  { date: '02/16', satisfaction: 87, positive: 33, negative: 5 },
  { date: '02/17', satisfaction: 89, positive: 36, negative: 4 },
  { date: '02/18', satisfaction: 85, positive: 29, negative: 5 },
  { date: '02/19', satisfaction: 86, positive: 32, negative: 5 },
  { date: '02/20', satisfaction: 88, positive: 34, negative: 4 },
  { date: '02/21', satisfaction: 84, positive: 27, negative: 5 },
  { date: '02/22', satisfaction: 90, positive: 38, negative: 4 },
  { date: '02/23', satisfaction: 87, positive: 33, negative: 5 },
  { date: '02/24', satisfaction: 86, positive: 30, negative: 5 },
  { date: '02/25', satisfaction: 88, positive: 35, negative: 5 },
  { date: '02/26', satisfaction: 85, positive: 28, negative: 5 },
  { date: '02/27', satisfaction: 89, positive: 37, negative: 5 },
  { date: '02/28', satisfaction: 87, positive: 32, negative: 5 },
  { date: '03/01', satisfaction: 86, positive: 30, negative: 5 },
  { date: '03/02', satisfaction: 84, positive: 27, negative: 5 },
  { date: '03/03', satisfaction: 88, positive: 34, negative: 4 },
  { date: '03/04', satisfaction: 87, positive: 33, negative: 5 },
  { date: '03/05', satisfaction: 85, positive: 29, negative: 5 },
  { date: '03/06', satisfaction: 86, positive: 31, negative: 5 },
  { date: '03/07', satisfaction: 89, positive: 36, negative: 4 },
  { date: '03/08', satisfaction: 87, positive: 32, negative: 5 },
  { date: '03/09', satisfaction: 88, positive: 35, negative: 4 },
  { date: '03/10', satisfaction: 86, positive: 30, negative: 5 },
  { date: '03/11', satisfaction: 87, positive: 33, negative: 5 },
];

export function getDailyQualityByPeriod(period: PeriodFilter): DailyQualityData[] {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  return DAILY_QUALITY_DATA.slice(-Math.min(days, DAILY_QUALITY_DATA.length));
}
