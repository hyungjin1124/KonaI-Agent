import type {
  DomainRole,
  DomainRoleDefinition,
  HierarchicalOrgNode,
  EnhancedUser,
  DataScopeType,
} from '../../../../types';

// ============================================================
// 15 Domain Role Definitions
// ============================================================

export const DOMAIN_ROLE_DEFINITIONS: DomainRoleDefinition[] = [
  // exec
  { code: 'ROLE_EXEC', displayName: '경영진', domain: 'exec', description: '전사 경영정보 조회, EIS 대시보드 접근', color: 'purple' },
  { code: 'ROLE_DEPT_MGR', displayName: '부서관리자', domain: 'exec', description: '소속 부서/부문 데이터 관리 및 조회', color: 'violet' },
  { code: 'ROLE_VIEWER', displayName: '일반 뷰어', domain: 'exec', description: '최소 접근 — 환율 등 공개 데이터만 조회', color: 'gray' },
  // fin
  { code: 'ROLE_FIN_ADMIN', displayName: '재무관리자', domain: 'fin', description: '전체 재무 데이터 관리 (AC/CFS/CF/CR/TA/AP)', color: 'emerald' },
  { code: 'ROLE_FIN_USER', displayName: '재무실무자', domain: 'fin', description: '소속 부서 재무 전표 및 자금 조회', color: 'teal' },
  // hr
  { code: 'ROLE_HR_ADMIN', displayName: 'HR관리자', domain: 'hr', description: '전체 인사/급여 데이터 관리', color: 'pink' },
  { code: 'ROLE_HR_USER', displayName: 'HR실무자', domain: 'hr', description: '관할 부서 인사 데이터 조회 (급여 제외)', color: 'rose' },
  // sales
  { code: 'ROLE_SALES_MGR', displayName: '영업관리자', domain: 'sales', description: '사업부 전체 영업 데이터 및 채권 관리', color: 'blue' },
  { code: 'ROLE_SALES_USER', displayName: '영업실무자', domain: 'sales', description: '소속 부서 매출/수주 데이터 조회', color: 'sky' },
  // pjt
  { code: 'ROLE_PJT_MGR', displayName: '프로젝트PM', domain: 'pjt', description: '담당 프로젝트 전체 데이터 및 비용 관리', color: 'indigo' },
  // prod
  { code: 'ROLE_PROD_MGR', displayName: '생산관리자', domain: 'prod', description: '공장 전체 생산/재고/원가 데이터 관리', color: 'orange' },
  { code: 'ROLE_PROD_USER', displayName: '생산실무자', domain: 'prod', description: '담당 라인 작업지시/입출고 조회 (원가 제외)', color: 'amber' },
  // scm
  { code: 'ROLE_PURCH_USER', displayName: '구매담당', domain: 'scm', description: '구매 발주 및 매입 데이터 관리', color: 'lime' },
  { code: 'ROLE_LOG_USER', displayName: '물류담당', domain: 'scm', description: '창고 재고 및 입출고 데이터 관리', color: 'green' },
  // sys
  { code: 'ROLE_SYS_ADMIN', displayName: '시스템관리자', domain: 'sys', description: '시스템 설정 및 감사 로그 전체 접근', color: 'red' },
];

export const ROLE_DOMAIN_LABELS: Record<string, string> = {
  exec: '경영/일반',
  fin: '재무',
  hr: '인사',
  sales: '영업',
  pjt: '프로젝트',
  prod: '생산',
  scm: '구매/물류',
  sys: '시스템',
};

export function getRoleDefinition(code: DomainRole): DomainRoleDefinition {
  return DOMAIN_ROLE_DEFINITIONS.find(r => r.code === code)!;
}

// ============================================================
// Organization Tree (6 divisions, 3-tier hierarchy)
// ============================================================

export const ORG_TREE: HierarchicalOrgNode[] = [
  {
    id: 'div-mgmt', code: 'DIV_MGMT', name: '경영지원', tier: 'division', parentId: null,
    children: [
      {
        id: 'sec-plan', code: 'SEC_PLAN', name: '경영기획부문', tier: 'section', parentId: 'div-mgmt',
        children: [
          { id: 'unit-plan-office', code: 'UNIT_PLAN', name: '경영기획실', tier: 'unit', parentId: 'sec-plan' },
          { id: 'unit-innov', code: 'UNIT_INNOV', name: '경영혁신팀', tier: 'unit', parentId: 'sec-plan' },
          { id: 'unit-irpr', code: 'UNIT_IRPR', name: 'IR/PR팀', tier: 'unit', parentId: 'sec-plan' },
        ],
      },
      {
        id: 'sec-admin', code: 'SEC_ADMIN', name: '경영관리부문', tier: 'section', parentId: 'div-mgmt',
        children: [
          { id: 'unit-admin-mgmt', code: 'UNIT_ADMIN_MGMT', name: '경영관리팀', tier: 'unit', parentId: 'sec-admin' },
          { id: 'unit-legal', code: 'UNIT_LEGAL', name: '법무팀', tier: 'unit', parentId: 'sec-admin' },
          { id: 'unit-hr', code: 'UNIT_HR', name: 'HR팀', tier: 'unit', parentId: 'sec-admin' },
        ],
      },
    ],
  },
  {
    id: 'div-fin', code: 'DIV_FIN', name: '재무회계', tier: 'division', parentId: null,
    children: [
      {
        id: 'sec-fin', code: 'SEC_FIN', name: '재무회계부문', tier: 'section', parentId: 'div-fin',
        children: [
          { id: 'unit-fin', code: 'UNIT_FIN', name: '재무팀', tier: 'unit', parentId: 'sec-fin' },
          { id: 'unit-acct', code: 'UNIT_ACCT', name: '회계팀', tier: 'unit', parentId: 'sec-fin' },
        ],
      },
    ],
  },
  {
    id: 'div-biz', code: 'DIV_BIZ', name: '사업', tier: 'division', parentId: null,
    children: [
      {
        id: 'sec-did', code: 'SEC_DID', name: 'DID사업부문', tier: 'section', parentId: 'div-biz',
        children: [
          { id: 'unit-did-domestic', code: 'UNIT_DID_DOM', name: 'DID국내사업실', tier: 'unit', parentId: 'sec-did' },
          { id: 'unit-did-overseas', code: 'UNIT_DID_OVS', name: 'DID해외사업실', tier: 'unit', parentId: 'sec-did' },
          { id: 'unit-did-dev', code: 'UNIT_DID_DEV', name: 'DID개발그룹', tier: 'unit', parentId: 'sec-did' },
        ],
      },
      {
        id: 'sec-data', code: 'SEC_DATA', name: '데이터사업부문', tier: 'section', parentId: 'div-biz',
        children: [
          { id: 'unit-datamining', code: 'UNIT_DM', name: '데이터마이닝팀', tier: 'unit', parentId: 'sec-data' },
          { id: 'unit-ai', code: 'UNIT_AI', name: 'AI팀', tier: 'unit', parentId: 'sec-data' },
          { id: 'unit-databiz', code: 'UNIT_DB', name: '데이터사업팀', tier: 'unit', parentId: 'sec-data' },
        ],
      },
      {
        id: 'sec-platform-biz', code: 'SEC_PLAT_BIZ', name: '플랫폼사업부문', tier: 'section', parentId: 'div-biz',
        children: [
          { id: 'unit-local-currency', code: 'UNIT_LC', name: '지역화폐사업실', tier: 'unit', parentId: 'sec-platform-biz' },
          { id: 'unit-marketing', code: 'UNIT_MKT', name: '마케팅그룹', tier: 'unit', parentId: 'sec-platform-biz' },
        ],
      },
      {
        id: 'sec-newbiz', code: 'SEC_NEWBIZ', name: '신사업부문', tier: 'section', parentId: 'div-biz',
        children: [
          { id: 'unit-culture', code: 'UNIT_CULTURE', name: '문화사업팀', tier: 'unit', parentId: 'sec-newbiz' },
          { id: 'unit-mvno', code: 'UNIT_MVNO', name: 'MVNO사업팀', tier: 'unit', parentId: 'sec-newbiz' },
        ],
      },
    ],
  },
  {
    id: 'div-platform', code: 'DIV_PLAT', name: '플랫폼', tier: 'division', parentId: null,
    children: [
      {
        id: 'sec-plat-ops', code: 'SEC_PLAT_OPS', name: '플랫폼운영부문', tier: 'section', parentId: 'div-platform',
        children: [
          { id: 'unit-payment', code: 'UNIT_PAY', name: '결제플랫폼팀', tier: 'unit', parentId: 'sec-plat-ops' },
          { id: 'unit-infra', code: 'UNIT_INFRA', name: '인프라Processing팀', tier: 'unit', parentId: 'sec-plat-ops' },
        ],
      },
      {
        id: 'sec-plat-svc', code: 'SEC_PLAT_SVC', name: '플랫폼서비스부문', tier: 'section', parentId: 'div-platform',
        children: [
          { id: 'unit-svc', code: 'UNIT_SVC', name: '서비스팀', tier: 'unit', parentId: 'sec-plat-svc' },
          { id: 'unit-cs', code: 'UNIT_CS', name: '고객만족서비스', tier: 'unit', parentId: 'sec-plat-svc' },
        ],
      },
      {
        id: 'sec-kona-plat', code: 'SEC_KONA_PLAT', name: '코나플랫폼부문', tier: 'section', parentId: 'div-platform',
        children: [
          { id: 'unit-biz1', code: 'UNIT_BIZ1', name: 'Biz1그룹', tier: 'unit', parentId: 'sec-kona-plat' },
          { id: 'unit-biz2', code: 'UNIT_BIZ2', name: 'Biz2그룹', tier: 'unit', parentId: 'sec-kona-plat' },
          { id: 'unit-biz3', code: 'UNIT_BIZ3', name: 'Biz3그룹', tier: 'unit', parentId: 'sec-kona-plat' },
          { id: 'unit-biz-support', code: 'UNIT_BIZ_SUP', name: 'Biz지원그룹', tier: 'unit', parentId: 'sec-kona-plat' },
        ],
      },
    ],
  },
  {
    id: 'div-mfg', code: 'DIV_MFG', name: '제조', tier: 'division', parentId: null,
    children: [
      {
        id: 'sec-chip', code: 'SEC_CHIP', name: 'Chip&카드사업부문', tier: 'section', parentId: 'div-mfg',
        children: [
          { id: 'unit-card-sales', code: 'UNIT_CARD_SALES', name: '카드영업부', tier: 'unit', parentId: 'sec-chip' },
          { id: 'unit-scm', code: 'UNIT_SCM', name: 'SCM', tier: 'unit', parentId: 'sec-chip' },
          { id: 'unit-prod', code: 'UNIT_PROD', name: '생산Group', tier: 'unit', parentId: 'sec-chip' },
          { id: 'unit-se', code: 'UNIT_SE', name: 'SE솔루션', tier: 'unit', parentId: 'sec-chip' },
        ],
      },
    ],
  },
  {
    id: 'div-tech', code: 'DIV_TECH', name: '기술', tier: 'division', parentId: null,
    children: [
      {
        id: 'sec-rnd', code: 'SEC_RND', name: 'R&D Center', tier: 'section', parentId: 'div-tech',
        children: [
          { id: 'unit-pay-dev', code: 'UNIT_PAY_DEV', name: '결제플랫폼개발실', tier: 'unit', parentId: 'sec-rnd' },
          { id: 'unit-server', code: 'UNIT_SERVER', name: '서버/웹/앱 그룹', tier: 'unit', parentId: 'sec-rnd' },
          { id: 'unit-iot', code: 'UNIT_IOT', name: 'IoT개발그룹', tier: 'unit', parentId: 'sec-rnd' },
          { id: 'unit-qa', code: 'UNIT_QA', name: 'QA', tier: 'unit', parentId: 'sec-rnd' },
          { id: 'unit-security', code: 'UNIT_SEC', name: '정보보안', tier: 'unit', parentId: 'sec-rnd' },
        ],
      },
    ],
  },
];

// Helper: find org node by id
export function findOrgNode(tree: HierarchicalOrgNode[], id: string): HierarchicalOrgNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findOrgNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper: build org path string
export function buildOrgPath(tree: HierarchicalOrgNode[], nodeId: string): string {
  const path: string[] = [];
  const find = (nodes: HierarchicalOrgNode[], target: string, trail: string[]): boolean => {
    for (const node of nodes) {
      const current = [...trail, node.name];
      if (node.id === target) {
        path.push(...current);
        return true;
      }
      if (node.children && find(node.children, target, current)) return true;
    }
    return false;
  };
  find(tree, nodeId, []);
  return path.join(' > ');
}

// ============================================================
// Mock Enhanced Users (~31)
// ============================================================

export const MOCK_ENHANCED_USERS: EnhancedUser[] = [
  { id: 'u01', name: '김대표', email: 'ceo@konai.com', department: '경영지원', division: '경영지원', position: '대표이사', positionLevel: '임원', orgNodeId: 'div-mgmt', orgPath: '경영지원', roles: ['ROLE_EXEC', 'ROLE_SYS_ADMIN'], status: 'Active', lastLogin: '2026-03-16 09:00', avatarColor: '#FF3C42' },
  { id: 'u02', name: '박기획', email: 'plan.park@konai.com', department: '경영기획실', division: '경영지원', position: '실장', positionLevel: '관리자', orgNodeId: 'unit-plan-office', orgPath: '경영지원 > 경영기획부문 > 경영기획실', roles: ['ROLE_EXEC', 'ROLE_DEPT_MGR'], status: 'Active', lastLogin: '2026-03-16 08:30', avatarColor: '#8B5CF6' },
  { id: 'u03', name: '이기획', email: 'plan.lee@konai.com', department: '경영기획실', division: '경영지원', position: '팀원', positionLevel: '실무자', orgNodeId: 'unit-plan-office', orgPath: '경영지원 > 경영기획부문 > 경영기획실', roles: ['ROLE_VIEWER'], status: 'Active', lastLogin: '2026-03-15 17:00', avatarColor: '#3B82F6' },
  { id: 'u04', name: '최혁신', email: 'innov.choi@konai.com', department: '경영혁신팀', division: '경영지원', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-innov', orgPath: '경영지원 > 경영기획부문 > 경영혁신팀', roles: ['ROLE_DEPT_MGR'], status: 'Active', lastLogin: '2026-03-14 10:00', avatarColor: '#10B981' },
  { id: 'u05', name: '정IR', email: 'ir.jung@konai.com', department: 'IR/PR팀', division: '경영지원', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-irpr', orgPath: '경영지원 > 경영기획부문 > IR/PR팀', roles: ['ROLE_VIEWER', 'ROLE_DEPT_MGR'], status: 'Active', lastLogin: '2026-03-15 14:00', avatarColor: '#F59E0B' },
  { id: 'u06', name: '한관리', email: 'admin.han@konai.com', department: '경영관리팀', division: '경영지원', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-admin-mgmt', orgPath: '경영지원 > 경영관리부문 > 경영관리팀', roles: ['ROLE_DEPT_MGR', 'ROLE_FIN_USER'], status: 'Active', lastLogin: '2026-03-16 09:15', avatarColor: '#14B8A6' },
  { id: 'u07', name: '윤인사', email: 'hr.yoon@konai.com', department: 'HR팀', division: '경영지원', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-hr', orgPath: '경영지원 > 경영관리부문 > HR팀', roles: ['ROLE_HR_ADMIN'], status: 'Active', lastLogin: '2026-03-16 08:45', avatarColor: '#EC4899' },
  { id: 'u08', name: '서인사', email: 'hr.seo@konai.com', department: 'HR팀', division: '경영지원', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-hr', orgPath: '경영지원 > 경영관리부문 > HR팀', roles: ['ROLE_HR_USER'], status: 'Active', lastLogin: '2026-03-15 16:30', avatarColor: '#F43F5E' },
  { id: 'u09', name: '강CFO', email: 'cfo.kang@konai.com', department: '재무팀', division: '재무회계', position: '부문장', positionLevel: '임원', orgNodeId: 'unit-fin', orgPath: '재무회계 > 재무회계부문 > 재무팀', roles: ['ROLE_FIN_ADMIN', 'ROLE_EXEC'], status: 'Active', lastLogin: '2026-03-16 09:00', avatarColor: '#059669' },
  { id: 'u10', name: '임재무', email: 'fin.lim@konai.com', department: '재무팀', division: '재무회계', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-fin', orgPath: '재무회계 > 재무회계부문 > 재무팀', roles: ['ROLE_FIN_USER'], status: 'Active', lastLogin: '2026-03-15 18:00', avatarColor: '#0D9488' },
  { id: 'u11', name: '조회계', email: 'acct.jo@konai.com', department: '회계팀', division: '재무회계', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-acct', orgPath: '재무회계 > 재무회계부문 > 회계팀', roles: ['ROLE_FIN_ADMIN'], status: 'Active', lastLogin: '2026-03-15 17:30', avatarColor: '#10B981' },
  { id: 'u12', name: '배세무', email: 'tax.bae@konai.com', department: '회계팀', division: '재무회계', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-acct', orgPath: '재무회계 > 재무회계부문 > 회계팀', roles: ['ROLE_FIN_USER'], status: 'Active', lastLogin: '2026-03-14 16:00', avatarColor: '#14B8A6' },
  { id: 'u13', name: '오실장', email: 'did.oh@konai.com', department: 'DID국내사업실', division: '사업', position: '실장', positionLevel: '관리자', orgNodeId: 'unit-did-domestic', orgPath: '사업 > DID사업부문 > DID국내사업실', roles: ['ROLE_SALES_MGR', 'ROLE_DEPT_MGR'], status: 'Active', lastLogin: '2026-03-16 08:00', avatarColor: '#3B82F6' },
  { id: 'u14', name: '노영업', email: 'sales.noh@konai.com', department: 'DID국내사업실', division: '사업', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-did-domestic', orgPath: '사업 > DID사업부문 > DID국내사업실', roles: ['ROLE_SALES_USER'], status: 'Active', lastLogin: '2026-03-15 17:45', avatarColor: '#0EA5E9' },
  { id: 'u15', name: '문해외', email: 'overseas.moon@konai.com', department: 'DID해외사업실', division: '사업', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-did-overseas', orgPath: '사업 > DID사업부문 > DID해외사업실', roles: ['ROLE_SALES_USER'], status: 'Active', lastLogin: '2026-03-14 11:00', avatarColor: '#38BDF8' },
  { id: 'u16', name: '장그룹장', email: 'dev.jang@konai.com', department: 'DID개발그룹', division: '사업', position: '그룹장', positionLevel: '관리자', orgNodeId: 'unit-did-dev', orgPath: '사업 > DID사업부문 > DID개발그룹', roles: ['ROLE_PJT_MGR', 'ROLE_DEPT_MGR'], status: 'Active', lastLogin: '2026-03-16 09:30', avatarColor: '#6366F1' },
  { id: 'u17', name: '류개발', email: 'dev.ryu@konai.com', department: 'DID개발그룹', division: '사업', position: '개발자', positionLevel: '실무자', orgNodeId: 'unit-did-dev', orgPath: '사업 > DID사업부문 > DID개발그룹', roles: ['ROLE_VIEWER'], status: 'Active', lastLogin: '2026-03-15 18:30', avatarColor: '#94A3B8' },
  { id: 'u18', name: '양AI', email: 'ai.yang@konai.com', department: 'AI팀', division: '사업', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-ai', orgPath: '사업 > 데이터사업부문 > AI팀', roles: ['ROLE_DEPT_MGR', 'ROLE_PJT_MGR'], status: 'Active', lastLogin: '2026-03-16 10:00', avatarColor: '#818CF8' },
  { id: 'u19', name: '하문화', email: 'culture.ha@konai.com', department: '문화사업팀', division: '사업', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-culture', orgPath: '사업 > 신사업부문 > 문화사업팀', roles: ['ROLE_SALES_MGR', 'ROLE_PJT_MGR'], status: 'Active', lastLogin: '2026-03-14 15:00', avatarColor: '#4F46E5' },
  { id: 'u20', name: '구부문장', email: 'plat.koo@konai.com', department: '플랫폼운영부문', division: '플랫폼', position: '부문장', positionLevel: '임원', orgNodeId: 'sec-plat-ops', orgPath: '플랫폼 > 플랫폼운영부문', roles: ['ROLE_DEPT_MGR', 'ROLE_EXEC'], status: 'Active', lastLogin: '2026-03-16 08:15', avatarColor: '#A855F7' },
  { id: 'u21', name: '성Biz', email: 'biz.sung@konai.com', department: 'Biz1그룹', division: '플랫폼', position: '그룹장', positionLevel: '관리자', orgNodeId: 'unit-biz1', orgPath: '플랫폼 > 코나플랫폼부문 > Biz1그룹', roles: ['ROLE_SALES_MGR'], status: 'Active', lastLogin: '2026-03-15 13:00', avatarColor: '#2563EB' },
  { id: 'u22', name: '전지원', email: 'support.jeon@konai.com', department: 'Biz지원그룹', division: '플랫폼', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-biz-support', orgPath: '플랫폼 > 코나플랫폼부문 > Biz지원그룹', roles: ['ROLE_SALES_USER', 'ROLE_PURCH_USER'], status: 'Active', lastLogin: '2026-03-14 09:30', avatarColor: '#84CC16' },
  { id: 'u23', name: '남부서장', email: 'card.nam@konai.com', department: '카드영업부', division: '제조', position: '부서장', positionLevel: '관리자', orgNodeId: 'unit-card-sales', orgPath: '제조 > Chip&카드사업부문 > 카드영업부', roles: ['ROLE_SALES_MGR', 'ROLE_PROD_MGR'], status: 'Active', lastLogin: '2026-03-16 07:30', avatarColor: '#EA580C' },
  { id: 'u24', name: '심SCM', email: 'scm.shim@konai.com', department: 'SCM', division: '제조', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-scm', orgPath: '제조 > Chip&카드사업부문 > SCM', roles: ['ROLE_PURCH_USER', 'ROLE_LOG_USER'], status: 'Active', lastLogin: '2026-03-15 16:00', avatarColor: '#65A30D' },
  { id: 'u25', name: '황생산', email: 'prod.hwang@konai.com', department: '생산Group', division: '제조', position: '관리자', positionLevel: '관리자', orgNodeId: 'unit-prod', orgPath: '제조 > Chip&카드사업부문 > 생산Group', roles: ['ROLE_PROD_MGR'], status: 'Active', lastLogin: '2026-03-16 06:00', avatarColor: '#F97316' },
  { id: 'u26', name: '추생산', email: 'prod.choo@konai.com', department: '생산Group', division: '제조', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-prod', orgPath: '제조 > Chip&카드사업부문 > 생산Group', roles: ['ROLE_PROD_USER'], status: 'Active', lastLogin: '2026-03-15 06:30', avatarColor: '#F59E0B' },
  { id: 'u27', name: '백SE', email: 'se.baek@konai.com', department: 'SE솔루션', division: '제조', position: '담당', positionLevel: '실무자', orgNodeId: 'unit-se', orgPath: '제조 > Chip&카드사업부문 > SE솔루션', roles: ['ROLE_SALES_USER', 'ROLE_PJT_MGR'], status: 'Active', lastLogin: '2026-03-14 14:00', avatarColor: '#6366F1' },
  { id: 'u28', name: '안실장', email: 'dev.ahn@konai.com', department: '결제플랫폼개발실', division: '기술', position: '실장', positionLevel: '관리자', orgNodeId: 'unit-pay-dev', orgPath: '기술 > R&D Center > 결제플랫폼개발실', roles: ['ROLE_PJT_MGR', 'ROLE_DEPT_MGR'], status: 'Active', lastLogin: '2026-03-16 09:45', avatarColor: '#4F46E5' },
  { id: 'u29', name: '권보안', email: 'sec.kwon@konai.com', department: '정보보안', division: '기술', position: '팀장', positionLevel: '관리자', orgNodeId: 'unit-security', orgPath: '기술 > R&D Center > 정보보안', roles: ['ROLE_SYS_ADMIN'], status: 'Active', lastLogin: '2026-03-16 10:15', avatarColor: '#DC2626' },
  { id: 'u30', name: '홍QA', email: 'qa.hong@konai.com', department: 'QA', division: '기술', position: 'QA', positionLevel: '실무자', orgNodeId: 'unit-qa', orgPath: '기술 > R&D Center > QA', roles: ['ROLE_VIEWER'], status: 'Inactive', lastLogin: '2026-03-01 09:00', avatarColor: '#94A3B8' },
  { id: 'u31', name: '신입사', email: 'new.shin@konai.com', department: '서버/웹/앱 그룹', division: '기술', position: '인턴', positionLevel: '실무자', orgNodeId: 'unit-server', orgPath: '기술 > R&D Center > 서버/웹/앱 그룹', roles: ['ROLE_VIEWER'], status: 'Pending', lastLogin: '-', avatarColor: '#CBD5E1' },
];
