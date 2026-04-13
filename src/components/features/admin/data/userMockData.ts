import type { AdminUser } from '../types/admin.types';

// ── 사용자 목록 ─────────────────────────────────────────────────────────────
// 설계 문서(admin-ia.md) 예시 사용자를 포함.
// 기본 정렬(최근 활동일 desc) 시 상위 행에 모든 엣지 케이스가 노출되도록 구성:
//   - 3+ 그룹 (+N truncation)  → 황생산 (03.29)
//   - 그룹 없음 (— 표시)       → 최민호 (03.28)
//   - "나" 뱃지 + 관리자       → 양AI  (03.27)
//   - 관리자 + 단일 그룹       → 이대표 (03.25)
//   - 복수 그룹 (2개)          → 김영수 (03.24), 정수진 (03.22)
//   - 단일 그룹                → 박지은 (03.20)
//   - 활동일 없음 (— 표시)     → 신입사 ("-")

export const ADMIN_USERS: AdminUser[] = [
  // ── 설계 예시 사용자 ──────────────────────────────────────────────────────
  { id: 'u-kimys', name: '김영수', email: 'kim@kona.com', team: '생산기술팀', role: '일반', status: '활성', lastActivityDate: '2026.03.24', avatarColor: '#3B82F6' },
  { id: 'u-parkje', name: '박지은', email: 'park@kona.com', team: '회계팀', role: '일반', status: '활성', lastActivityDate: '2026.03.20', avatarColor: '#EC4899' },
  { id: 'u-leedp', name: '이대표', email: 'lee@kona.com', team: '대표실', role: '관리자', status: '활성', lastActivityDate: '2026.03.25', avatarColor: '#FF3C42' },
  { id: 'u-choimh', name: '최민호', email: 'choi@kona.com', team: '영업1팀', role: '일반', status: '활성', lastActivityDate: '2026.03.28', avatarColor: '#F97316' },
  { id: 'u-jungsj', name: '정수진', email: 'jung@kona.com', team: '구매팀', role: '일반', status: '활성', lastActivityDate: '2026.03.22', avatarColor: '#14B8A6' },

  // ── 기존 사용자 (역할·그룹·활동일 다양) ──────────────────────────────────
  { id: 'u01', name: '김대표', email: 'ceo@konai.com', team: '경영지원', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#DC2626' },
  { id: 'u02', name: '박기획', email: 'plan.park@konai.com', team: '경영기획실', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#8B5CF6' },
  { id: 'u04', name: '최혁신', email: 'innov.choi@konai.com', team: '경영혁신팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#10B981' },
  { id: 'u07', name: '윤인사', email: 'hr.yoon@konai.com', team: 'HR팀', role: '일반', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#EC4899' },
  { id: 'u09', name: '강CFO', email: 'cfo.kang@konai.com', team: '재무팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#059669' },
  { id: 'u10', name: '임재무', email: 'fin.lim@konai.com', team: '재무팀', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#0D9488' },
  { id: 'u11', name: '조회계', email: 'acct.jo@konai.com', team: '회계팀', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#10B981' },
  { id: 'u13', name: '오실장', email: 'did.oh@konai.com', team: 'DID국내사업실', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#3B82F6' },
  { id: 'u14', name: '노영업', email: 'sales.noh@konai.com', team: 'DID국내사업실', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#0EA5E9' },
  { id: 'u16', name: '장그룹장', email: 'dev.jang@konai.com', team: 'DID개발그룹', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#6366F1' },
  { id: 'u17', name: '류개발', email: 'dev.ryu@konai.com', team: 'DID개발그룹', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#94A3B8' },
  { id: 'u18', name: '양AI', email: 'ai.yang@konai.com', team: 'AI팀', role: '관리자', status: '활성', lastActivityDate: '2026.03.27', avatarColor: '#818CF8' },
  { id: 'u20', name: '구부문장', email: 'plat.koo@konai.com', team: '플랫폼운영부문', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#A855F7' },
  { id: 'u21', name: '성Biz', email: 'biz.sung@konai.com', team: 'Biz1그룹', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#2563EB' },
  { id: 'u23', name: '남부서장', email: 'card.nam@konai.com', team: '카드영업부', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#EA580C' },
  { id: 'u24', name: '심SCM', email: 'scm.shim@konai.com', team: 'SCM', role: '일반', status: '활성', lastActivityDate: '2026.03.15', avatarColor: '#65A30D' },
  { id: 'u25', name: '황생산', email: 'prod.hwang@konai.com', team: '생산Group', role: '일반', status: '활성', lastActivityDate: '2026.03.29', avatarColor: '#F97316' },
  { id: 'u28', name: '안실장', email: 'dev.ahn@konai.com', team: '결제플랫폼개발실', role: '관리자', status: '활성', lastActivityDate: '2026.03.16', avatarColor: '#4F46E5' },
  { id: 'u29', name: '권보안', email: 'sec.kwon@konai.com', team: '정보보안', role: '일반', status: '활성', lastActivityDate: '2026.03.14', avatarColor: '#DC2626' },

  // ── 비활성·미활동 사용자 (엣지 케이스) ────────────────────────────────────
  { id: 'u30', name: '홍QA', email: 'qa.hong@konai.com', team: 'QA', role: '일반', status: '비활성', lastActivityDate: '2026.03.01', avatarColor: '#94A3B8' },
  { id: 'u31', name: '신입사', email: 'new.shin@konai.com', team: '서버/웹/앱 그룹', role: '일반', status: '비활성', lastActivityDate: '-', avatarColor: '#CBD5E1' },
];

// 팀 목록 (필터용) — ADMIN_USERS에서 자동 생성
export const TEAM_LIST = [
  ...new Set(ADMIN_USERS.map((u) => u.team)),
].sort();

// 현재 로그인 사용자 (관리자)
export const CURRENT_ADMIN_USER_ID = 'u18';
