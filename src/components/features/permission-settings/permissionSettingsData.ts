import type {
  ErpViewTable,
  TableAccessPolicy,
  OrgUnit,
  RowFilterRule,
  ColumnMaskPolicy,
  MaskingType,
} from '../../../types';

// --- Layer 1: ERP View Tables ---

export const ERP_VIEW_TABLES: ErpViewTable[] = [
  // 재무
  { id: 'vt-001', name: 'V_FIN_INCOME_STMT',  displayName: '손익계산서 뷰',   category: '재무', description: '월별 손익 집계 뷰' },
  { id: 'vt-002', name: 'V_FIN_BALANCE_SHEET', displayName: '대차대조표 뷰',   category: '재무', description: '기간별 재무상태표' },
  { id: 'vt-003', name: 'V_FIN_CASHFLOW',      displayName: '현금흐름 뷰',     category: '재무', description: '현금흐름 집계' },
  // 영업
  { id: 'vt-004', name: 'V_SALES_SUMMARY',     displayName: '매출 요약 뷰',    category: '영업', description: '기간별 매출 집계' },
  { id: 'vt-005', name: 'V_SALES_ORDER',       displayName: '수주 현황 뷰',    category: '영업', description: '수주 오더 현황' },
  { id: 'vt-006', name: 'V_CUSTOMER_MASTER',   displayName: '고객 마스터 뷰',  category: '영업', description: '고객 기본정보' },
  // 인사
  { id: 'vt-007', name: 'V_HR_HEADCOUNT',      displayName: '인력 현황 뷰',    category: '인사', description: '부서별 인원 현황' },
  { id: 'vt-008', name: 'V_HR_PAYROLL',        displayName: '급여 집계 뷰',    category: '인사', description: '급여 집계 (민감)' },
  // 구매
  { id: 'vt-009', name: 'V_PUR_ORDER',         displayName: '구매발주 뷰',     category: '구매', description: '구매 오더 현황' },
  { id: 'vt-010', name: 'V_PUR_VENDOR',        displayName: '공급업체 뷰',     category: '구매', description: '공급업체 마스터' },
];

export const TABLE_CATEGORIES = ['재무', '영업', '인사', '구매'] as const;

// --- Layer 1: Initial Access Policies ---

export const INITIAL_TABLE_ACCESS: TableAccessPolicy[] = [
  {
    role: 'Super Admin',
    allowedTableIds: ERP_VIEW_TABLES.map(t => t.id),
  },
  {
    role: 'Data Manager',
    allowedTableIds: ['vt-004', 'vt-005', 'vt-006', 'vt-009', 'vt-010'],
  },
  {
    role: 'Viewer',
    allowedTableIds: ['vt-004', 'vt-007'],
  },
];

// --- Layer 2: Org Units ---

export const ORG_UNITS: OrgUnit[] = [
  { id: 'ou-001', code: 'D001', name: '전략기획실',   type: '부서코드' },
  { id: 'ou-002', code: 'D002', name: 'DID사업부',    type: '부서코드' },
  { id: 'ou-003', code: 'D003', name: '플랫폼개발팀', type: '부서코드' },
  { id: 'ou-004', code: 'D004', name: '영업본부',     type: '부서코드' },
  { id: 'ou-005', code: 'D005', name: '재무팀',       type: '부서코드' },
  { id: 'ou-010', code: 'BU01', name: 'B2B사업',      type: '사업영역' },
  { id: 'ou-011', code: 'BU02', name: 'B2C사업',      type: '사업영역' },
  { id: 'ou-020', code: 'CC01', name: '한국법인',     type: '법인코드' },
  { id: 'ou-021', code: 'CC02', name: '미국법인',     type: '법인코드' },
];

export const ORG_ATTRIBUTE_TYPES = ['부서코드', '사업영역', '법인코드'] as const;

// --- Layer 2: Row Filter Rules ---

export const ROW_FILTER_RULES: RowFilterRule[] = [
  // Super Admin — 모든 조직 속성에 전체 접근
  { id: 'rfr-001', role: 'Super Admin', attributeType: '부서코드', allowedOrgUnitIds: ['ou-001', 'ou-002', 'ou-003', 'ou-004', 'ou-005'], description: '모든 부서 접근' },
  { id: 'rfr-002', role: 'Super Admin', attributeType: '사업영역', allowedOrgUnitIds: ['ou-010', 'ou-011'], description: '모든 사업영역 접근' },
  { id: 'rfr-003', role: 'Super Admin', attributeType: '법인코드', allowedOrgUnitIds: ['ou-020', 'ou-021'], description: '모든 법인 접근' },
  // Data Manager — 담당 부서 + 사업영역만
  { id: 'rfr-004', role: 'Data Manager', attributeType: '부서코드', allowedOrgUnitIds: ['ou-002', 'ou-003'], description: '담당 부서 행만 조회' },
  { id: 'rfr-005', role: 'Data Manager', attributeType: '사업영역', allowedOrgUnitIds: ['ou-010'], description: 'B2B사업 영역만 조회' },
  { id: 'rfr-006', role: 'Data Manager', attributeType: '법인코드', allowedOrgUnitIds: ['ou-020'], description: '한국법인만 조회' },
  // Viewer — 소속 기준
  { id: 'rfr-007', role: 'Viewer', attributeType: '부서코드', allowedOrgUnitIds: [], description: '소속 부서 자동 적용' },
  { id: 'rfr-008', role: 'Viewer', attributeType: '사업영역', allowedOrgUnitIds: [], description: '소속 사업영역 자동 적용' },
  { id: 'rfr-009', role: 'Viewer', attributeType: '법인코드', allowedOrgUnitIds: ['ou-020'], description: '한국법인만 조회' },
];

// --- Layer 3: Column Mask Policies ---

export const COLUMN_MASK_POLICIES: ColumnMaskPolicy[] = [
  {
    id: 'cmp-001',
    tableId: 'vt-008',
    columnName: 'SALARY_AMT',
    columnDisplayName: '급여액',
    sensitivity: 'high',
    maskingRules: [
      { role: 'Super Admin', maskingType: 'full',    maskingExample: '3,500,000' },
      { role: 'Data Manager', maskingType: 'partial', maskingExample: '***0,000' },
      { role: 'Viewer',       maskingType: 'hidden',  maskingExample: '●●●●●●●' },
    ],
  },
  {
    id: 'cmp-002',
    tableId: 'vt-008',
    columnName: 'BONUS_AMT',
    columnDisplayName: '상여금',
    sensitivity: 'high',
    maskingRules: [
      { role: 'Super Admin', maskingType: 'full',    maskingExample: '1,200,000' },
      { role: 'Data Manager', maskingType: 'hidden',  maskingExample: '●●●●●●●' },
      { role: 'Viewer',       maskingType: 'hidden',  maskingExample: '●●●●●●●' },
    ],
  },
  {
    id: 'cmp-003',
    tableId: 'vt-009',
    columnName: 'UNIT_PRICE',
    columnDisplayName: '단가',
    sensitivity: 'medium',
    maskingRules: [
      { role: 'Super Admin', maskingType: 'full',    maskingExample: '125,000' },
      { role: 'Data Manager', maskingType: 'full',    maskingExample: '125,000' },
      { role: 'Viewer',       maskingType: 'partial', maskingExample: '***,000' },
    ],
  },
  {
    id: 'cmp-004',
    tableId: 'vt-006',
    columnName: 'CONTACT_NO',
    columnDisplayName: '연락처',
    sensitivity: 'medium',
    maskingRules: [
      { role: 'Super Admin', maskingType: 'full',    maskingExample: '010-1234-5678' },
      { role: 'Data Manager', maskingType: 'partial', maskingExample: '010-****-5678' },
      { role: 'Viewer',       maskingType: 'hidden',  maskingExample: '●●●●●●●●●●●●' },
    ],
  },
];

// --- Helpers ---

const MASKING_EXAMPLES: Record<string, Record<MaskingType, string>> = {
  SALARY_AMT:  { full: '3,500,000',       partial: '***0,000',       hidden: '●●●●●●●' },
  BONUS_AMT:   { full: '1,200,000',       partial: '***0,000',       hidden: '●●●●●●●' },
  UNIT_PRICE:  { full: '125,000',         partial: '***,000',        hidden: '●●●●●●●' },
  CONTACT_NO:  { full: '010-1234-5678',   partial: '010-****-5678',  hidden: '●●●●●●●●●●●●' },
};

export function getMaskingExample(columnName: string, maskingType: MaskingType): string {
  return MASKING_EXAMPLES[columnName]?.[maskingType] ?? (maskingType === 'hidden' ? '●●●●●●●' : '***');
}

export const MASKING_TYPE_LABELS: Record<MaskingType, string> = {
  full: '완전 표시',
  partial: '부분 마스킹',
  hidden: '완전 숨김',
};
