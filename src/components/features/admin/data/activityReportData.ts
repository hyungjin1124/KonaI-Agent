import type {
  UserActivity,
  SkillUsageRecord,
  ServiceMetrics,
  ArtifactDistribution,
  ActiveUserTrend,
} from '../types/admin.types';

// ── 그룹 A: 도입 현황 ──────────────────────────────────────────────────────

export const ADOPTION_KPI = {
  activeUsers: { value: '27/31', subtitle: '활성 사용자 / 전체' },
  avgWeeklyActiveDays: { value: '3.8일', subtitle: '주간 활성일 평균' },
};

export const ACTIVE_USER_TREND: ActiveUserTrend[] = [
  { date: '3/1', count: 22 },
  { date: '3/3', count: 24 },
  { date: '3/5', count: 23 },
  { date: '3/7', count: 26 },
  { date: '3/10', count: 25 },
  { date: '3/12', count: 27 },
  { date: '3/14', count: 24 },
  { date: '3/17', count: 26 },
  { date: '3/19', count: 28 },
  { date: '3/21', count: 27 },
  { date: '3/24', count: 29 },
  { date: '3/26', count: 27 },
];

export const USER_ACTIVITIES: UserActivity[] = [
  { userName: '김대표', team: '경영지원', lastActivityDate: '2026.03.26', weeklyConversations: 12, activityLevel: '활발' },
  { userName: '박기획', team: '경영기획실', lastActivityDate: '2026.03.26', weeklyConversations: 15, activityLevel: '활발' },
  { userName: '강CFO', team: '재무팀', lastActivityDate: '2026.03.26', weeklyConversations: 11, activityLevel: '활발' },
  { userName: '양AI', team: 'AI팀', lastActivityDate: '2026.03.26', weeklyConversations: 22, activityLevel: '활발' },
  { userName: '오실장', team: 'DID국내사업실', lastActivityDate: '2026.03.26', weeklyConversations: 9, activityLevel: '활발' },
  { userName: '한관리', team: '경영관리팀', lastActivityDate: '2026.03.26', weeklyConversations: 8, activityLevel: '활발' },
  { userName: '장그룹장', team: 'DID개발그룹', lastActivityDate: '2026.03.26', weeklyConversations: 14, activityLevel: '활발' },
  { userName: '이기획', team: '경영기획실', lastActivityDate: '2026.03.25', weeklyConversations: 7, activityLevel: '활발' },
  { userName: '류개발', team: 'DID개발그룹', lastActivityDate: '2026.03.26', weeklyConversations: 10, activityLevel: '활발' },
  { userName: '구부문장', team: '플랫폼운영부문', lastActivityDate: '2026.03.26', weeklyConversations: 6, activityLevel: '보통' },
  { userName: '권보안', team: '정보보안', lastActivityDate: '2026.03.26', weeklyConversations: 5, activityLevel: '보통' },
  { userName: '안실장', team: '결제플랫폼개발실', lastActivityDate: '2026.03.26', weeklyConversations: 5, activityLevel: '보통' },
  { userName: '남부서장', team: '카드영업부', lastActivityDate: '2026.03.26', weeklyConversations: 4, activityLevel: '보통' },
  { userName: '서인사', team: 'HR팀', lastActivityDate: '2026.03.25', weeklyConversations: 4, activityLevel: '보통' },
  { userName: '윤인사', team: 'HR팀', lastActivityDate: '2026.03.24', weeklyConversations: 3, activityLevel: '보통' },
  { userName: '최혁신', team: '경영혁신팀', lastActivityDate: '2026.03.24', weeklyConversations: 3, activityLevel: '보통' },
  { userName: '임재무', team: '재무팀', lastActivityDate: '2026.03.24', weeklyConversations: 3, activityLevel: '보통' },
  { userName: '조회계', team: '회계팀', lastActivityDate: '2026.03.24', weeklyConversations: 2, activityLevel: '보통' },
  { userName: '성Biz', team: 'Biz1그룹', lastActivityDate: '2026.03.26', weeklyConversations: 2, activityLevel: '보통' },
  { userName: '노영업', team: 'DID국내사업실', lastActivityDate: '2026.03.25', weeklyConversations: 2, activityLevel: '보통' },
  { userName: '전지원', team: 'Biz지원그룹', lastActivityDate: '2026.03.24', weeklyConversations: 2, activityLevel: '보통' },
  { userName: '심SCM', team: 'SCM', lastActivityDate: '2026.03.23', weeklyConversations: 2, activityLevel: '보통' },
  { userName: '황생산', team: '생산Group', lastActivityDate: '2026.03.23', weeklyConversations: 1, activityLevel: '보통' },
  { userName: '문해외', team: 'DID해외사업실', lastActivityDate: '2026.03.23', weeklyConversations: 1, activityLevel: '보통' },
  { userName: '하문화', team: '문화사업팀', lastActivityDate: '2026.03.14', weeklyConversations: 0, activityLevel: '미사용' },
  { userName: '배세무', team: '회계팀', lastActivityDate: '2026.03.14', weeklyConversations: 0, activityLevel: '미사용' },
  { userName: '정IR', team: 'IR/PR팀', lastActivityDate: '2026.03.15', weeklyConversations: 0, activityLevel: '미사용' },
  { userName: '백SE', team: 'SE솔루션', lastActivityDate: '2026.03.14', weeklyConversations: 0, activityLevel: '미사용' },
  { userName: '추생산', team: '생산Group', lastActivityDate: '2026.03.15', weeklyConversations: 0, activityLevel: '미사용' },
  { userName: '홍QA', team: 'QA', lastActivityDate: '2026.03.01', weeklyConversations: 0, activityLevel: '미사용' },
  { userName: '신입사', team: '서버/웹/앱 그룹', lastActivityDate: '-', weeklyConversations: 0, activityLevel: '미사용' },
];

// ── 그룹 B: 스킬 활용 ──────────────────────────────────────────────────────

export const SKILL_KPI = {
  skillCount: { value: '24', subtitle: '생성/수정된 스킬' },
  creatorCount: { value: '8', subtitle: '스킬 생성 사용자' },
};

export const SKILL_USAGE_RECORDS: SkillUsageRecord[] = [
  { skillName: '문서 생성', callCount: 187, userCount: 18, author: '양AI', authorTeam: 'AI팀' },
  { skillName: '데이터 분석', callCount: 145, userCount: 15, author: '양AI', authorTeam: 'AI팀' },
  { skillName: 'ERP 조회', callCount: 132, userCount: 12, author: '장그룹장', authorTeam: 'DID개발그룹' },
  { skillName: 'PPT 생성', callCount: 98, userCount: 10, author: '양AI', authorTeam: 'AI팀' },
  { skillName: '이메일 발송', callCount: 76, userCount: 8, author: '한관리', authorTeam: '경영관리팀' },
  { skillName: 'DB 분석', callCount: 65, userCount: 5, author: '류개발', authorTeam: 'DID개발그룹' },
  { skillName: '일정 관리', callCount: 54, userCount: 7, author: '윤인사', authorTeam: 'HR팀' },
  { skillName: '번역', callCount: 43, userCount: 6, author: '문해외', authorTeam: 'DID해외사업실' },
  { skillName: '코드 분석', callCount: 38, userCount: 4, author: '장그룹장', authorTeam: 'DID개발그룹' },
  { skillName: 'OCR 분석', callCount: 22, userCount: 3, author: '조회계', authorTeam: '회계팀' },
];

// ── 그룹 C: 서비스 성과 ─────────────────────────────────────────────────────

export const SERVICE_METRICS: ServiceMetrics = {
  returnRate: { value: '87.1%' },
  artifactCount: { value: '1,340' },
  skillExecutions: { value: '860' },
};

export const ARTIFACT_DISTRIBUTION: ArtifactDistribution[] = [
  { type: 'PPT', percentage: 42, count: 563, color: '#FF3C42' },
  { type: '분석 리포트', percentage: 31, count: 415, color: '#3B82F6' },
  { type: '이메일 초안', percentage: 15, count: 201, color: '#F59E0B' },
  { type: '기타', percentage: 12, count: 161, color: '#94A3B8' },
];
