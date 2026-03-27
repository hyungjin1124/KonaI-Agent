import type { AdminUser } from '../types/admin.types';

// 기존 MOCK_ENHANCED_USERS (31명)에서 변환
// - 15개 domain roles → 2역할 (ROLE_SYS_ADMIN, ROLE_EXEC, ROLE_DEPT_MGR 중 하나라도 있으면 '관리자')
// - orgPath 마지막 세그먼트 → team
// - status: Active→활성, 나머지→비활성

export const ADMIN_USERS: AdminUser[] = [
  { id: 'u01', name: '김대표', email: 'ceo@konai.com', team: '경영지원', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#FF3C42' },
  { id: 'u02', name: '박기획', email: 'plan.park@konai.com', team: '경영기획실', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#8B5CF6' },
  { id: 'u03', name: '이기획', email: 'plan.lee@konai.com', team: '경영기획실', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#3B82F6' },
  { id: 'u04', name: '최혁신', email: 'innov.choi@konai.com', team: '경영혁신팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#10B981' },
  { id: 'u05', name: '정IR', email: 'ir.jung@konai.com', team: 'IR/PR팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#F59E0B' },
  { id: 'u06', name: '한관리', email: 'admin.han@konai.com', team: '경영관리팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#14B8A6' },
  { id: 'u07', name: '윤인사', email: 'hr.yoon@konai.com', team: 'HR팀', role: '일반', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#EC4899' },
  { id: 'u08', name: '서인사', email: 'hr.seo@konai.com', team: 'HR팀', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#F43F5E' },
  { id: 'u09', name: '강CFO', email: 'cfo.kang@konai.com', team: '재무팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#059669' },
  { id: 'u10', name: '임재무', email: 'fin.lim@konai.com', team: '재무팀', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#0D9488' },
  { id: 'u11', name: '조회계', email: 'acct.jo@konai.com', team: '회계팀', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#10B981' },
  { id: 'u12', name: '배세무', email: 'tax.bae@konai.com', team: '회계팀', role: '일반', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#14B8A6' },
  { id: 'u13', name: '오실장', email: 'did.oh@konai.com', team: 'DID국내사업실', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#3B82F6' },
  { id: 'u14', name: '노영업', email: 'sales.noh@konai.com', team: 'DID국내사업실', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#0EA5E9' },
  { id: 'u15', name: '문해외', email: 'overseas.moon@konai.com', team: 'DID해외사업실', role: '일반', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#38BDF8' },
  { id: 'u16', name: '장그룹장', email: 'dev.jang@konai.com', team: 'DID개발그룹', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#6366F1' },
  { id: 'u17', name: '류개발', email: 'dev.ryu@konai.com', team: 'DID개발그룹', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#94A3B8' },
  { id: 'u18', name: '양AI', email: 'ai.yang@konai.com', team: 'AI팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#818CF8' },
  { id: 'u19', name: '하문화', email: 'culture.ha@konai.com', team: '문화사업팀', role: '일반', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#4F46E5' },
  { id: 'u20', name: '구부문장', email: 'plat.koo@konai.com', team: '플랫폼운영부문', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#A855F7' },
  { id: 'u21', name: '성Biz', email: 'biz.sung@konai.com', team: 'Biz1그룹', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#2563EB' },
  { id: 'u22', name: '전지원', email: 'support.jeon@konai.com', team: 'Biz지원그룹', role: '일반', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#84CC16' },
  { id: 'u23', name: '남부서장', email: 'card.nam@konai.com', team: '카드영업부', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#EA580C' },
  { id: 'u24', name: '심SCM', email: 'scm.shim@konai.com', team: 'SCM', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#65A30D' },
  { id: 'u25', name: '황생산', email: 'prod.hwang@konai.com', team: '생산Group', role: '일반', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#F97316' },
  { id: 'u26', name: '추생산', email: 'prod.choo@konai.com', team: '생산Group', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#F59E0B' },
  { id: 'u27', name: '백SE', email: 'se.baek@konai.com', team: 'SE솔루션', role: '일반', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#6366F1' },
  { id: 'u28', name: '안실장', email: 'dev.ahn@konai.com', team: '결제플랫폼개발실', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#4F46E5' },
  { id: 'u29', name: '권보안', email: 'sec.kwon@konai.com', team: '정보보안', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#DC2626' },
  { id: 'u30', name: '홍QA', email: 'qa.hong@konai.com', team: 'QA', role: '일반', status: '비활성', lastActivityDate: '2026.03.01', avatarColor: '#94A3B8' },
  { id: 'u31', name: '신입사', email: 'new.shin@konai.com', team: '서버/웹/앱 그룹', role: '일반', status: '비활성', lastActivityDate: '-', avatarColor: '#CBD5E1' },
];

// 팀 목록 (필터용)
export const TEAM_LIST = [
  ...new Set(ADMIN_USERS.map((u) => u.team)),
].sort();

// 현재 로그인 사용자 (관리자)
export const CURRENT_ADMIN_USER_ID = 'u18';
