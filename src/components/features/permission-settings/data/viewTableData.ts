import type {
  ModuleCode,
  ModuleDefinition,
  ViewSubcategory,
  DomainRole,
  AccessLevel,
  DomainAccessMatrix,
  RoleDefinition,
  DataScopeType,
} from '../../../../types';

// ============================================================================
// Module Definitions — 20 ERP Modules (19 unique codes)
// ============================================================================

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { code: 'AC',  name: '회계/재무',      subcategoryCount: 11 },
  { code: 'CFS', name: '연결재무',       subcategoryCount: 1 },
  { code: 'SL',  name: '영업/매출',      subcategoryCount: 3 },
  { code: 'AP',  name: '자금/지출',      subcategoryCount: 2 },
  { code: 'CF',  name: 'CFS/자금계획',   subcategoryCount: 2 },
  { code: 'CR',  name: '보고서',         subcategoryCount: 1 },
  { code: 'PU',  name: '구매',          subcategoryCount: 2 },
  { code: 'TA',  name: '세무',          subcategoryCount: 2 },
  { code: 'PD',  name: '생산',          subcategoryCount: 3 },
  { code: 'LG',  name: '물류/재고',      subcategoryCount: 2 },
  { code: 'PJ',  name: '프로젝트',      subcategoryCount: 2 },
  { code: 'HR',  name: '인사',          subcategoryCount: 1 },
  { code: 'PR',  name: '급여',          subcategoryCount: 1 },
  { code: 'DA',  name: '기준정보',      subcategoryCount: 1 },
  { code: 'ESM', name: '원가분석',      subcategoryCount: 1 },
  { code: 'ABC', name: '수익성',        subcategoryCount: 1 },
  { code: 'EIS', name: '경영정보',      subcategoryCount: 5 },
  { code: 'BNK', name: '은행/카드',      subcategoryCount: 1 },
  { code: 'KOD', name: '수출입',        subcategoryCount: 1 },
];

// ============================================================================
// 43 View Subcategories (시트 ②)
// ============================================================================

export const VIEW_SUBCATEGORIES: ViewSubcategory[] = [
  // AC (11)
  { id: 'AC_01', moduleCode: 'AC', subcategoryName: '전표',            viewCount: 7,  sensitivityLevel: '높음' },
  { id: 'AC_02', moduleCode: 'AC', subcategoryName: '재무상태표 B/S',   viewCount: 10, sensitivityLevel: '높음' },
  { id: 'AC_03', moduleCode: 'AC', subcategoryName: '손익계산서 P/L',   viewCount: 6,  sensitivityLevel: '높음' },
  { id: 'AC_04', moduleCode: 'AC', subcategoryName: '예산관리',         viewCount: 17, sensitivityLevel: '중간' },
  { id: 'AC_05', moduleCode: 'AC', subcategoryName: '고정자산',         viewCount: 13, sensitivityLevel: '중간' },
  { id: 'AC_06', moduleCode: 'AC', subcategoryName: '자금/어음',        viewCount: 7,  sensitivityLevel: '높음' },
  { id: 'AC_07', moduleCode: 'AC', subcategoryName: '원장/시산표',      viewCount: 9,  sensitivityLevel: '높음' },
  { id: 'AC_08', moduleCode: 'AC', subcategoryName: '채권채무/수금',    viewCount: 10, sensitivityLevel: '높음' },
  { id: 'AC_09', moduleCode: 'AC', subcategoryName: '비용/배부',        viewCount: 12, sensitivityLevel: '중간' },
  { id: 'AC_10', moduleCode: 'AC', subcategoryName: '경비/현금출납',    viewCount: 6,  sensitivityLevel: '중간' },
  { id: 'AC_11', moduleCode: 'AC', subcategoryName: '외화관리',         viewCount: 3,  sensitivityLevel: '중간' },
  // CFS (1)
  { id: 'CFS_01', moduleCode: 'CFS', subcategoryName: '연결B/S·P/L',  viewCount: 6,  sensitivityLevel: '높음' },
  // SL (3)
  { id: 'SL_01', moduleCode: 'SL', subcategoryName: '매출/수주/출하',   viewCount: 8,  sensitivityLevel: '중간' },
  { id: 'SL_02', moduleCode: 'SL', subcategoryName: '수출관리',         viewCount: 3,  sensitivityLevel: '중간' },
  { id: 'SL_03', moduleCode: 'SL', subcategoryName: '영업실적/Tier1',   viewCount: 11, sensitivityLevel: '중간' },
  // AP (2)
  { id: 'AP_01', moduleCode: 'AP', subcategoryName: '입출금/자금집행',  viewCount: 8,  sensitivityLevel: '높음' },
  { id: 'AP_02', moduleCode: 'AP', subcategoryName: '자금Tier1',       viewCount: 6,  sensitivityLevel: '높음' },
  // CF (2)
  { id: 'CF_01', moduleCode: 'CF', subcategoryName: 'CFS운영',        viewCount: 10, sensitivityLevel: '높음' },
  { id: 'CF_02', moduleCode: 'CF', subcategoryName: '자금계획',        viewCount: 8,  sensitivityLevel: '높음' },
  // CR (1)
  { id: 'CR_01', moduleCode: 'CR', subcategoryName: '보고서',          viewCount: 4,  sensitivityLevel: '높음' },
  // PU (2)
  { id: 'PU_01', moduleCode: 'PU', subcategoryName: '발주/입고',       viewCount: 4,  sensitivityLevel: '중간' },
  { id: 'PU_02', moduleCode: 'PU', subcategoryName: '매입관리',        viewCount: 8,  sensitivityLevel: '중간' },
  // TA (2)
  { id: 'TA_01', moduleCode: 'TA', subcategoryName: '부가세/세금계산서', viewCount: 14, sensitivityLevel: '높음' },
  { id: 'TA_02', moduleCode: 'TA', subcategoryName: '원천세',          viewCount: 2,  sensitivityLevel: '높음' },
  // PD (3)
  { id: 'PD_01', moduleCode: 'PD', subcategoryName: '작업지시/실적',   viewCount: 5,  sensitivityLevel: '중간' },
  { id: 'PD_02', moduleCode: 'PD', subcategoryName: '생산원가',        viewCount: 12, sensitivityLevel: '높음' },
  { id: 'PD_03', moduleCode: 'PD', subcategoryName: '외주/BOM/Tier1',  viewCount: 10, sensitivityLevel: '중간' },
  // LG (2)
  { id: 'LG_01', moduleCode: 'LG', subcategoryName: '입출고/재고',     viewCount: 6,  sensitivityLevel: '낮음' },
  { id: 'LG_02', moduleCode: 'LG', subcategoryName: '창고관리',        viewCount: 12, sensitivityLevel: '낮음' },
  // PJ (2)
  { id: 'PJ_01', moduleCode: 'PJ', subcategoryName: '프로젝트현황',    viewCount: 8,  sensitivityLevel: '중간' },
  { id: 'PJ_02', moduleCode: 'PJ', subcategoryName: '프로젝트Tier1',   viewCount: 7,  sensitivityLevel: '중간' },
  // HR (1)
  { id: 'HR_01', moduleCode: 'HR', subcategoryName: '인사/발령/근태',  viewCount: 7,  sensitivityLevel: '높음' },
  // PR (1)
  { id: 'PR_01', moduleCode: 'PR', subcategoryName: '급여/상여',       viewCount: 5,  sensitivityLevel: '매우높음' },
  // DA (1)
  { id: 'DA_01', moduleCode: 'DA', subcategoryName: '환율',           viewCount: 2,  sensitivityLevel: '낮음' },
  // ESM (1)
  { id: 'ESM_01', moduleCode: 'ESM', subcategoryName: '원가분석',     viewCount: 6,  sensitivityLevel: '높음' },
  // ABC (1)
  { id: 'ABC_01', moduleCode: 'ABC', subcategoryName: '수익성지표',    viewCount: 4,  sensitivityLevel: '높음' },
  // EIS (5)
  { id: 'EIS_01', moduleCode: 'EIS', subcategoryName: '경영대시보드',  viewCount: 12, sensitivityLevel: '높음' },
  { id: 'EIS_02', moduleCode: 'EIS', subcategoryName: '영업분석',     viewCount: 7,  sensitivityLevel: '중간' },
  { id: 'EIS_03', moduleCode: 'EIS', subcategoryName: '구매분석',     viewCount: 5,  sensitivityLevel: '중간' },
  { id: 'EIS_04', moduleCode: 'EIS', subcategoryName: '재무분석',     viewCount: 4,  sensitivityLevel: '높음' },
  { id: 'EIS_05', moduleCode: 'EIS', subcategoryName: '카드/외주/인사', viewCount: 7, sensitivityLevel: '중간' },
  // BNK (1)
  { id: 'BNK_01', moduleCode: 'BNK', subcategoryName: '은행잔고/카드', viewCount: 3,  sensitivityLevel: '높음' },
  // KOD (1)
  { id: 'KOD_01', moduleCode: 'KOD', subcategoryName: '수출입',       viewCount: 2,  sensitivityLevel: '중간' },
];

// Total view count validation: 345
// sum = 7+10+6+17+13+7+9+10+12+6+3 + 6 + 8+3+11 + 8+6 + 10+8 + 4 + 4+8 + 14+2 + 5+12+10 + 6+12 + 8+7 + 7 + 5 + 2 + 6 + 4 + 12+7+5+4+7 + 3 + 2 = 345

// ============================================================================
// Access Level helpers
// ============================================================================

const F: AccessLevel = 'full';            // ●
const D: AccessLevel = 'dept_restricted'; // ◐
const S: AccessLevel = 'summary_only';    // ○
const N: AccessLevel = 'no_access';       // —
const M: AccessLevel = 'column_masked';   // 🔒

export const ACCESS_LEVEL_DISPLAY: Record<AccessLevel, { icon: string; label: string; color: string; bgColor: string }> = {
  full:            { icon: '●', label: '전체접근',      color: 'text-green-700',  bgColor: 'bg-green-50' },
  dept_restricted: { icon: '◐', label: '부서/조직 제한', color: 'text-blue-700',   bgColor: 'bg-blue-50' },
  summary_only:    { icon: '○', label: '요약만',        color: 'text-gray-600',   bgColor: 'bg-gray-50' },
  no_access:       { icon: '—', label: '접근불가',      color: 'text-red-600',    bgColor: 'bg-red-50' },
  column_masked:   { icon: '🔒', label: '컬럼마스킹',   color: 'text-amber-700',  bgColor: 'bg-amber-50' },
};

export const ACCESS_LEVEL_CYCLE: AccessLevel[] = [
  'full', 'dept_restricted', 'summary_only', 'no_access', 'column_masked',
];

// ============================================================================
// Default Access Matrix — 15 roles × 43 subcategories (시트 ②)
// Order: SYS_ADMIN, FIN_ADMIN, FIN_USER, SALES_MGR, SALES_USER, PURCH_USER,
//        PROD_MGR, PROD_USER, LOG_USER, PJT_MGR, HR_ADMIN, HR_USER,
//        EXEC, DEPT_MGR, VIEWER
// ============================================================================

type AccessRow = [
  AccessLevel, AccessLevel, AccessLevel, AccessLevel, AccessLevel,
  AccessLevel, AccessLevel, AccessLevel, AccessLevel, AccessLevel,
  AccessLevel, AccessLevel, AccessLevel, AccessLevel, AccessLevel,
];

// prettier-ignore
const MATRIX_DATA: Record<string, AccessRow> = {
  //                       SYS  FIN_A FIN_U SAL_M SAL_U PUR_U PRD_M PRD_U LOG_U PJT_M HR_A  HR_U  EXEC  DPT_M VIEW
  'AC_01': /* 전표       */ [F,   F,    D,    S,    N,    N,    N,    N,    N,    N,    N,    N,    S,    D,    N],
  'AC_02': /* 재무상태표  */ [F,   F,    D,    S,    N,    N,    N,    N,    N,    N,    N,    N,    S,    N,    N],
  'AC_03': /* 손익계산서  */ [F,   F,    D,    S,    N,    N,    N,    N,    N,    N,    N,    N,    S,    N,    N],
  'AC_04': /* 예산관리    */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    D,    N,    N,    S,    D,    N],
  'AC_05': /* 고정자산    */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'AC_06': /* 자금/어음   */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'AC_07': /* 원장/시산표 */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'AC_08': /* 채권채무    */ [F,   F,    D,    D,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'AC_09': /* 비용/배부   */ [F,   F,    D,    N,    N,    N,    D,    N,    N,    D,    N,    N,    N,    D,    N],
  'AC_10': /* 경비/현금   */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    D,    N],
  'AC_11': /* 외화관리    */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'CFS_01':/* 연결B/S    */ [F,   F,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    S,    N,    N],
  'SL_01': /* 매출/수주   */ [F,   F,    D,    F,    D,    N,    N,    N,    D,    N,    N,    N,    S,    D,    N],
  'SL_02': /* 수출관리    */ [F,   F,    N,    F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'SL_03': /* 영업실적    */ [F,   F,    D,    F,    D,    N,    N,    N,    N,    N,    N,    N,    S,    D,    N],
  'AP_01': /* 입출금      */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'AP_02': /* 자금Tier1   */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'CF_01': /* CFS운영     */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'CF_02': /* 자금계획    */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    S,    N,    N],
  'CR_01': /* 보고서      */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    S,    N,    N],
  'PU_01': /* 발주/입고   */ [F,   F,    N,    N,    N,    F,    D,    N,    D,    N,    N,    N,    N,    N,    N],
  'PU_02': /* 매입관리    */ [F,   F,    D,    N,    N,    F,    D,    N,    N,    N,    N,    N,    N,    N,    N],
  'TA_01': /* 부가세      */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'TA_02': /* 원천세      */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'PD_01': /* 작업지시    */ [F,   S,    N,    N,    N,    N,    F,    D,    N,    N,    N,    N,    N,    N,    N],
  'PD_02': /* 생산원가    */ [F,   F,    N,    N,    N,    N,    F,    N,    N,    N,    N,    N,    S,    N,    N],
  'PD_03': /* 외주/BOM    */ [F,   S,    N,    N,    N,    D,    F,    D,    N,    N,    N,    N,    N,    N,    N],
  'LG_01': /* 입출고/재고 */ [F,   S,    N,    S,    N,    D,    D,    D,    F,    N,    N,    N,    N,    N,    N],
  'LG_02': /* 창고관리    */ [F,   N,    N,    N,    N,    D,    D,    D,    F,    N,    N,    N,    N,    N,    N],
  'PJ_01': /* 프로젝트현황*/ [F,   S,    N,    N,    N,    N,    N,    N,    N,    F,    N,    N,    S,    N,    N],
  'PJ_02': /* 프로젝트T1  */ [F,   N,    N,    N,    N,    N,    N,    N,    N,    F,    N,    N,    N,    N,    N],
  'HR_01': /* 인사/발령   */ [F,   N,    N,    N,    N,    N,    N,    N,    N,    N,    F,    D,    N,    M,    N],
  'PR_01': /* 급여/상여   */ [F,   N,    N,    N,    N,    N,    N,    N,    N,    N,    F,    N,    N,    N,    N],
  'DA_01': /* 환율        */ [F,   F,    F,    F,    F,    F,    F,    F,    F,    F,    F,    F,    F,    F,    F],
  'ESM_01':/* 원가분석    */ [F,   F,    D,    N,    N,    N,    F,    N,    N,    N,    N,    N,    S,    N,    N],
  'ABC_01':/* 수익성지표  */ [F,   F,    N,    F,    N,    N,    N,    N,    N,    N,    N,    N,    S,    N,    N],
  'EIS_01':/* 경영대시보드*/ [F,   F,    S,    S,    N,    N,    N,    N,    N,    N,    N,    N,    F,    S,    N],
  'EIS_02':/* 영업분석    */ [F,   F,    S,    F,    D,    N,    N,    N,    N,    N,    N,    N,    F,    D,    N],
  'EIS_03':/* 구매분석    */ [F,   F,    N,    N,    N,    F,    D,    N,    N,    N,    N,    N,    F,    N,    N],
  'EIS_04':/* 재무분석    */ [F,   F,    S,    N,    N,    N,    N,    N,    N,    N,    N,    N,    F,    N,    N],
  'EIS_05':/* 카드/외주   */ [F,   F,    N,    N,    N,    N,    D,    N,    N,    N,    D,    N,    F,    N,    N],
  'BNK_01':/* 은행잔고    */ [F,   F,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
  'KOD_01':/* 수출입      */ [F,   F,    N,    D,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N,    N],
};

const ROLE_INDEX: DomainRole[] = [
  'ROLE_SYS_ADMIN', 'ROLE_FIN_ADMIN', 'ROLE_FIN_USER',
  'ROLE_SALES_MGR', 'ROLE_SALES_USER', 'ROLE_PURCH_USER',
  'ROLE_PROD_MGR', 'ROLE_PROD_USER', 'ROLE_LOG_USER',
  'ROLE_PJT_MGR', 'ROLE_HR_ADMIN', 'ROLE_HR_USER',
  'ROLE_EXEC', 'ROLE_DEPT_MGR', 'ROLE_VIEWER',
];

function buildDefaultAccessMatrix(): DomainAccessMatrix[] {
  return ROLE_INDEX.map((role, roleIdx) => {
    const subcategoryAccess: Record<string, AccessLevel> = {};
    for (const [subcatId, row] of Object.entries(MATRIX_DATA)) {
      subcategoryAccess[subcatId] = row[roleIdx];
    }
    return { role, subcategoryAccess };
  });
}

export const DEFAULT_ACCESS_MATRIX: DomainAccessMatrix[] = buildDefaultAccessMatrix();

// ============================================================================
// Role Definitions (시트 ①)
// ============================================================================

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  { role: 'ROLE_SYS_ADMIN', nameKo: '시스템 관리자',  nameEn: 'System Admin',     description: '시스템 전체 설정, 사용자/역할 관리, 데이터 접근 정책 설정, 감사로그 조회', dataScope: 'All',        targetExample: '정보보안팀, IT관리자',       note: '최소 인원 지정 권장' },
  { role: 'ROLE_FIN_ADMIN', nameKo: '재무관리자',     nameEn: 'Finance Admin',    description: '회계/재무/세무/결산/자금/연결재무 전 모듈 전체 접근',                        dataScope: 'All',        targetExample: 'CFO, 재무팀장, 회계팀장' },
  { role: 'ROLE_FIN_USER',  nameKo: '재무담당자',     nameEn: 'Finance User',     description: '회계전표, 재무제표, 예산, 세무, 자금 등 재무 실무 데이터 접근',              dataScope: 'Department', targetExample: '재무팀·회계팀 실무자',       note: '타부서 전표 RLS 제한' },
  { role: 'ROLE_SALES_MGR', nameKo: '영업관리자',     nameEn: 'Sales Manager',    description: '영업/매출/수금 전체 + 매출원가/수익성분석 접근',                              dataScope: 'Division',   targetExample: '사업실장, Biz그룹장, 카드영업부장' },
  { role: 'ROLE_SALES_USER',nameKo: '영업담당자',     nameEn: 'Sales User',       description: '영업 실적, 수주/출하/매출, 거래처별 실적 조회',                               dataScope: 'Department', targetExample: '영업팀 실무자, Biz담당',     note: '원가 정보 마스킹' },
  { role: 'ROLE_PURCH_USER',nameKo: '구매담당자',     nameEn: 'Purchase User',    description: '구매발주, 입고, 매입전표, 거래처 관리 데이터 접근',                           dataScope: 'Department', targetExample: 'SCM팀, 구매담당' },
  { role: 'ROLE_PROD_MGR',  nameKo: '생산관리자',     nameEn: 'Production Mgr',   description: '생산계획/실적, BOM, 외주, 원가 전체 접근',                                    dataScope: 'Plant',      targetExample: '생산Group장' },
  { role: 'ROLE_PROD_USER', nameKo: '생산담당자',     nameEn: 'Production User',  description: '작업지시, 자재투입, 생산실적 조회',                                           dataScope: 'Plant+Line', targetExample: '생산Group 실무자',           note: '원가 정보 제한적' },
  { role: 'ROLE_LOG_USER',  nameKo: '물류담당자',     nameEn: 'Logistics User',   description: '입출고, 재고현황, 창고별 재고 조회',                                          dataScope: 'Warehouse',  targetExample: '재고담당, 물류담당' },
  { role: 'ROLE_PJT_MGR',   nameKo: '프로젝트관리자', nameEn: 'Project Manager',  description: '프로젝트 현황, 투입비용, 인력현황, 예산 관리',                                dataScope: 'Project',    targetExample: '개발그룹장, PM' },
  { role: 'ROLE_HR_ADMIN',  nameKo: '인사관리자',     nameEn: 'HR Admin',         description: '인사/급여 전체 데이터 접근 (급여명세, 개인정보 포함)',                         dataScope: 'All',        targetExample: 'HR팀장',                     note: '개인정보 포함, 최소 인원' },
  { role: 'ROLE_HR_USER',   nameKo: '인사담당자',     nameEn: 'HR User',          description: '인사발령, 근태, 인원현황 조회 (급여 상세 제외)',                               dataScope: 'Department', targetExample: 'HR팀 담당자',                 note: '급여명세 제외' },
  { role: 'ROLE_EXEC',      nameKo: '경영진',        nameEn: 'Executive',         description: '경영정보(EIS) 대시보드 + 주요 재무제표 요약 조회',                            dataScope: 'All',        targetExample: '대표이사, 부문장, 임원',     note: '상세 전표 미접근' },
  { role: 'ROLE_DEPT_MGR',  nameKo: '부서관리자',     nameEn: 'Dept. Manager',    description: '소속 부서 관련 비용/예산/실적 조회',                                          dataScope: 'Department', targetExample: '팀장, 그룹장, 실장',          note: '예산/비용 실적 중심' },
  { role: 'ROLE_VIEWER',    nameKo: '일반조회자',     nameEn: 'General Viewer',   description: '공통 기준정보(환율, 계정과목) + 본인 관련 데이터만 조회',                     dataScope: 'Self',       targetExample: '일반 개발자, QA, 일반직원',  note: '최소 권한' },
];

export const ROLE_LABEL_MAP: Record<DomainRole, string> = Object.fromEntries(
  ROLE_DEFINITIONS.map(r => [r.role, r.nameKo]),
) as Record<DomainRole, string>;

export const ROLE_SHORT_LABEL_MAP: Record<DomainRole, string> = {
  ROLE_SYS_ADMIN: '시스템',
  ROLE_FIN_ADMIN: '재무관리',
  ROLE_FIN_USER:  '재무실무',
  ROLE_SALES_MGR: '영업관리',
  ROLE_SALES_USER:'영업실무',
  ROLE_PURCH_USER:'구매',
  ROLE_PROD_MGR:  '생산관리',
  ROLE_PROD_USER: '생산실무',
  ROLE_LOG_USER:  '물류',
  ROLE_PJT_MGR:   '프로젝트',
  ROLE_HR_ADMIN:  '인사관리',
  ROLE_HR_USER:   '인사실무',
  ROLE_EXEC:      '경영진',
  ROLE_DEPT_MGR:  '부서장',
  ROLE_VIEWER:    '조회',
};

// ============================================================================
// Sensitivity Level Display
// ============================================================================

export const SENSITIVITY_DISPLAY: Record<string, { label: string; color: string; bgColor: string }> = {
  '매우높음': { label: '매우높음', color: 'text-red-700',    bgColor: 'bg-red-100' },
  '높음':     { label: '높음',     color: 'text-orange-700', bgColor: 'bg-orange-100' },
  '중간':     { label: '중간',     color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  '낮음':     { label: '낮음',     color: 'text-green-700',  bgColor: 'bg-green-100' },
};
