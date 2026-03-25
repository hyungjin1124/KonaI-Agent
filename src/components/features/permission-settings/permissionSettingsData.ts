import type {
  DomainRole,
  DomainRowFilterRule,
  DomainColumnMaskPolicy,
  SensitiveColumnCategory,
  AccessLevel,
  DataScopeType,
  MaskingType,
  ResolvedEffectivePolicy,
} from '../../../types';

// ============================================================================
// Shared form constants
// ============================================================================

export const DATA_SCOPE_OPTIONS: { value: DataScopeType; label: string }[] = [
  { value: 'All', label: '전체' },
  { value: 'Division', label: '사업부 단위' },
  { value: 'Department', label: '부서 단위' },
  { value: 'Plant', label: '공장 단위' },
  { value: 'Plant+Line', label: '공장+라인' },
  { value: 'Warehouse', label: '창고 단위' },
  { value: 'Project', label: '프로젝트 단위' },
  { value: 'Self', label: '본인만' },
];

// ============================================================================
// RLS — Row-Level Security Policies (시트 ⑤)
// ============================================================================

export const DOMAIN_ROW_FILTER_RULES: DomainRowFilterRule[] = [
  {
    id: 'rls-01',
    role: 'ROLE_FIN_USER',
    filterBase: 'dept_code',
    filterColumn: 'dept_code',
    sqlWherePattern: 'WHERE dept_code IN (SELECT dept FROM user_dept_map WHERE user_id = :current_user)',
    targetViewGroups: 'AC 전표, 비용, 예산, 자금 관련 전체',
    example: '재무팀 담당자 → dept_code=재무팀 데이터만',
    note: '매핑 테이블 기반',
  },
  {
    id: 'rls-02',
    role: 'ROLE_SALES_USER',
    filterBase: 'sales_dept_code',
    filterColumn: 'sales_dept',
    sqlWherePattern: 'WHERE sales_dept IN (SELECT dept FROM user_dept_map WHERE user_id = :current_user)',
    targetViewGroups: 'SL 영업, EIS 영업분석',
    example: '영업1팀 → 영업1팀 매출만 조회',
  },
  {
    id: 'rls-03',
    role: 'ROLE_SALES_MGR',
    filterBase: 'division_code',
    filterColumn: 'division_code',
    sqlWherePattern: 'WHERE division_code IN (SELECT div FROM user_div_map WHERE user_id = :current_user)',
    targetViewGroups: 'SL 전체, ABC 수익성',
    example: 'DID사업부 실장 → DID사업부 전체 매출',
    note: '사업부 단위',
  },
  {
    id: 'rls-04',
    role: 'ROLE_PURCH_USER',
    filterBase: 'dept_code',
    filterColumn: 'dept_code',
    sqlWherePattern: 'WHERE dept_code = :user_dept',
    targetViewGroups: 'PU 구매, AP 매입 관련',
    example: 'SCM팀 → SCM팀 발주만',
  },
  {
    id: 'rls-05',
    role: 'ROLE_PROD_MGR',
    filterBase: 'plant_code',
    filterColumn: 'plant_code',
    sqlWherePattern: 'WHERE plant_code IN (SELECT plant FROM user_plant_map WHERE user_id = :current_user)',
    targetViewGroups: 'PD 생산, LG 물류, ESM 원가',
    example: '생산Group장 → 제조공장 데이터만',
    note: '공장 단위',
  },
  {
    id: 'rls-06',
    role: 'ROLE_PROD_USER',
    filterBase: 'plant_line_code',
    filterColumn: 'plant_code, line_code',
    sqlWherePattern: 'WHERE plant_code = :user_plant AND line_code = :user_line',
    targetViewGroups: 'PD 작업지시/실적',
    example: '생산담당 → 본사공장 A라인만',
    note: '라인 단위',
  },
  {
    id: 'rls-07',
    role: 'ROLE_LOG_USER',
    filterBase: 'wh_code',
    filterColumn: 'wh_code',
    sqlWherePattern: 'WHERE wh_code IN (SELECT wh FROM user_wh_map WHERE user_id = :current_user)',
    targetViewGroups: 'LG 재고/입출고',
    example: '재고담당 → 담당 창고 재고만',
    note: '창고 단위',
  },
  {
    id: 'rls-08',
    role: 'ROLE_PJT_MGR',
    filterBase: 'project_code',
    filterColumn: 'project_code',
    sqlWherePattern: 'WHERE project_code IN (SELECT pjt FROM user_pjt_map WHERE user_id = :current_user)',
    targetViewGroups: 'PJ 프로젝트 전체',
    example: '개발그룹장 → 담당 프로젝트만',
    note: '프로젝트 단위',
  },
  {
    id: 'rls-09',
    role: 'ROLE_HR_USER',
    filterBase: 'dept_code',
    filterColumn: 'dept_code',
    sqlWherePattern: 'WHERE dept_code IN (SELECT dept FROM hr_dept_map WHERE user_id = :current_user)',
    targetViewGroups: 'HR 인사/발령',
    example: 'HR담당 → 관할부서 인사정보만',
  },
  {
    id: 'rls-10',
    role: 'ROLE_DEPT_MGR',
    filterBase: 'dept_code',
    filterColumn: 'dept_code',
    sqlWherePattern: 'WHERE dept_code = :user_dept',
    targetViewGroups: 'AC 비용/예산, SL 실적, EIS 일부',
    example: '경영기획실 팀원 → 경영기획실 데이터만',
    note: '소속부서',
  },
  {
    id: 'rls-11',
    role: 'ROLE_EXEC',
    filterBase: 'none',
    filterColumn: '(필터 없음)',
    sqlWherePattern: '-- 필터 적용 안 함 → 전체 조직 데이터 조회 가능',
    targetViewGroups: 'EIS 경영정보, 재무제표 요약',
    example: 'CEO/부문장 → 전체 경영지표',
    note: '상세 전표 미접근',
  },
  {
    id: 'rls-12',
    role: 'ROLE_VIEWER',
    filterBase: 'user_id',
    filterColumn: 'created_by / assigned_to',
    sqlWherePattern: 'WHERE created_by = :current_user OR assigned_to = :current_user',
    targetViewGroups: '기준정보 (환율 등)',
    example: '일반직원 → 본인 생성/할당 데이터만',
    note: '최소 범위',
  },
];

// ============================================================================
// Column Masking Policies (시트 ⑥)
// ============================================================================

export const DOMAIN_COLUMN_MASK_POLICIES: DomainColumnMaskPolicy[] = [
  {
    id: 'cls-01',
    category: 'salary_bonus',
    categoryName: '급여/상여 금액',
    targetViews: 'view_pr_pay_result, view_payroll_monthly',
    maskingRule: '금액 → NULL 또는 "***"',
    exposedRoles: ['ROLE_HR_ADMIN'],
    maskedRoles: 'ROLE_HR_USER, ROLE_DEPT_MGR 외 전체',
    resultExample: '기본급: *** / 총액: ***',
  },
  {
    id: 'cls-02',
    category: 'ssn',
    categoryName: '주민등록번호',
    targetViews: 'view_employee_status, view_hr_emp_current',
    maskingRule: '뒷자리 마스킹',
    exposedRoles: ['ROLE_HR_ADMIN'],
    maskedRoles: 'ROLE_HR_USER, 기타 전체',
    resultExample: '900101-*******',
  },
  {
    id: 'cls-03',
    category: 'bank_account',
    categoryName: '계좌번호',
    targetViews: 'view_ap_cash_bank_acc, view_bank_account_balance',
    maskingRule: '중간 자리 마스킹',
    exposedRoles: ['ROLE_FIN_ADMIN', 'ROLE_SYS_ADMIN'],
    maskedRoles: 'ROLE_FIN_USER 포함 기타',
    resultExample: '110-***-***890',
  },
  {
    id: 'cls-04',
    category: 'unit_cost',
    categoryName: '단가/원가',
    targetViews: 'view_purchase_order_summary, view_product_cost_monthly',
    maskingRule: '금액 → 은닉',
    exposedRoles: ['ROLE_FIN_ADMIN', 'ROLE_PROD_MGR', 'ROLE_PURCH_USER'],
    maskedRoles: 'ROLE_SALES_USER, ROLE_VIEWER',
    resultExample: '단가: [비공개]',
  },
  {
    id: 'cls-05',
    category: 'vendor_contact',
    categoryName: '거래처 연락처',
    targetViews: 'view_ap_cust_pay_master, view_sl_cust_sales_emp',
    maskingRule: '전화번호 뒷자리 마스킹',
    exposedRoles: ['ROLE_SALES_MGR', 'ROLE_FIN_ADMIN'],
    maskedRoles: 'ROLE_VIEWER, ROLE_DEPT_MGR',
    resultExample: '010-****-5678',
  },
  {
    id: 'cls-06',
    category: 'employee_pii',
    categoryName: '사원 개인정보',
    targetViews: 'view_hr_admin_order_emp',
    maskingRule: '주소/연락처/가족 은닉',
    exposedRoles: ['ROLE_HR_ADMIN'],
    maskedRoles: '기타 전체',
    resultExample: '주소: [비공개]',
  },
];

// ============================================================================
// Masking Helpers (유지)
// ============================================================================

const MASKING_EXAMPLES: Record<string, Record<MaskingType, string>> = {
  salary_bonus:   { full: '3,500,000',       partial: '***0,000',       hidden: '●●●●●●●' },
  ssn:            { full: '900101-1234567',   partial: '900101-*******', hidden: '●●●●●●●●●●●●●●' },
  bank_account:   { full: '110-234-567890',   partial: '110-***-***890', hidden: '●●●●●●●●●●●●●' },
  unit_cost:      { full: '125,000',          partial: '[비공개]',       hidden: '●●●●●●●' },
  vendor_contact: { full: '010-1234-5678',    partial: '010-****-5678',  hidden: '●●●●●●●●●●●●' },
  employee_pii:   { full: '서울시 강남구...', partial: '[일부 비공개]',   hidden: '[비공개]' },
};

export function getMaskingExample(category: string, maskingType: MaskingType): string {
  return MASKING_EXAMPLES[category]?.[maskingType] ?? (maskingType === 'hidden' ? '●●●●●●●' : '***');
}

export const MASKING_TYPE_LABELS: Record<MaskingType, string> = {
  full: '완전 표시',
  partial: '부분 마스킹',
  hidden: '완전 숨김',
};

export const SENSITIVE_CATEGORY_LABELS: Record<SensitiveColumnCategory, string> = {
  salary_bonus: '급여/상여 금액',
  ssn: '주민등록번호',
  bank_account: '계좌번호',
  unit_cost: '단가/원가',
  vendor_contact: '거래처 연락처',
  employee_pii: '사원 개인정보',
};

// ============================================================================
// Conflict Resolution Engine (시트 ⑦)
// ============================================================================

const ACCESS_PRIORITY: Record<AccessLevel, number> = {
  full: 4,
  dept_restricted: 3,
  summary_only: 2,
  column_masked: 1,
  no_access: 0,
};

const SCOPE_PRIORITY: Record<DataScopeType, number> = {
  All: 7,
  Division: 6, Div: 6,
  Plant: 5, PlantLine: 4, 'Plant+Line': 4,
  Warehouse: 3, WH: 3,
  Project: 3, Pjt: 3,
  Department: 2, Dept: 2,
  Self: 1,
};

export function resolveEffectivePolicy(
  roles: DomainRole[],
  accessMatrix: Record<DomainRole, Record<string, AccessLevel>>,
  rlsRules: DomainRowFilterRule[],
  maskPolicies: DomainColumnMaskPolicy[],
): ResolvedEffectivePolicy {
  // 1. Subcategory access: union — highest access wins
  const subcategoryAccess: Record<string, AccessLevel> = {};
  for (const role of roles) {
    const roleAccess = accessMatrix[role];
    if (!roleAccess) continue;
    for (const [subcatId, level] of Object.entries(roleAccess)) {
      const current = subcategoryAccess[subcatId];
      if (!current || ACCESS_PRIORITY[level] > ACCESS_PRIORITY[current]) {
        subcategoryAccess[subcatId] = level;
      }
    }
  }

  // 2. RLS: wider scope wins + filter OR-union
  let rowScope: DataScopeType = 'Self';
  const rowFilters: string[] = [];
  for (const role of roles) {
    const rule = rlsRules.find(r => r.role === role);
    if (!rule) continue;

    // Find role scope from definition
    const roleDef = getRoleScopeMap()[role];
    if (roleDef && SCOPE_PRIORITY[roleDef] > SCOPE_PRIORITY[rowScope]) {
      rowScope = roleDef;
    }

    if (rule.filterBase !== 'none' && rule.sqlWherePattern.startsWith('WHERE')) {
      rowFilters.push(rule.sqlWherePattern);
    }
  }

  // 3. Column masking: expose wins over masked
  const columnMasking: Record<SensitiveColumnCategory, MaskingType> = {
    salary_bonus: 'hidden',
    ssn: 'hidden',
    bank_account: 'hidden',
    unit_cost: 'hidden',
    vendor_contact: 'hidden',
    employee_pii: 'hidden',
  };

  for (const policy of maskPolicies) {
    const hasExposedRole = roles.some(r => policy.exposedRoles.includes(r));
    if (hasExposedRole) {
      columnMasking[policy.category] = 'full';
    } else {
      // Determine partial vs hidden based on masking rule description
      const isPartial = /마스킹|SUBSTR|REPLACE|뒷자리|중간/i.test(policy.maskingRule);
      columnMasking[policy.category] = isPartial ? 'partial' : 'hidden';
    }
  }

  // 4. Audit warning: HR_ADMIN + non-HR role
  const hasHrAdmin = roles.includes('ROLE_HR_ADMIN');
  const hasNonHrRole = roles.some(r => r !== 'ROLE_HR_ADMIN' && r !== 'ROLE_HR_USER');
  const auditWarning = hasHrAdmin && hasNonHrRole;

  return { subcategoryAccess, rowScope, rowFilters, columnMasking, auditWarning };
}

function getRoleScopeMap(): Record<DomainRole, DataScopeType> {
  return {
    ROLE_SYS_ADMIN: 'All',
    ROLE_FIN_ADMIN: 'All',
    ROLE_FIN_USER: 'Department',
    ROLE_SALES_MGR: 'Division',
    ROLE_SALES_USER: 'Department',
    ROLE_PURCH_USER: 'Department',
    ROLE_PROD_MGR: 'Plant',
    ROLE_PROD_USER: 'Plant+Line',
    ROLE_LOG_USER: 'Warehouse',
    ROLE_PJT_MGR: 'Project',
    ROLE_HR_ADMIN: 'All',
    ROLE_HR_USER: 'Department',
    ROLE_EXEC: 'All',
    ROLE_DEPT_MGR: 'Department',
    ROLE_VIEWER: 'Self',
  };
}
