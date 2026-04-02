import type {
  ViewTable,
  ViewColumn,
  AccessTarget,
  DataPreview,
  UserViewTableAccess,
  ViewTableDomain,
  SourceType,
  CodeSecuRlsDisplay,
  ViewRlsExample,
} from '../types/data.types';

// ── 도메인 목록 ───────────────────────────────────────────────────────────────

export const DOMAIN_LIST: ViewTableDomain[] = [
  '생산', '회계', '인사', '영업', '구매', '물류', '프로젝트', '경영', '개발', '운영',
];

export const SOURCE_TYPE_LIST: SourceType[] = ['ERP', 'Jira', 'Excel', 'API', '기타'];

// ── 뷰테이블 목록 ────────────────────────────────────────────────────────────

export const VIEW_TABLES: ViewTable[] = [
  {
    viewId: 'v_bom_master',
    viewName: 'BOM 마스터 조회',
    description: '완제품 BOM 구성 정보와 구성 품목 상세를 제공하는 뷰',
    domain: '생산',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 1234, erpScreenName: 'BOM 조회' }],
    rlsType: 'mapping_table',
    rlsConfig: {
      mappingTableName: '_tpdbomdeptauthority',
      viewJoinKey: 'item_seq',
      mappingJoinKey: 'itemseq',
      mappingDeptKey: 'deptseq',
      fullAccessValue: '0',
    },
    isActive: true,
    updatedAt: '2026-02-10',
    accessTargetCount: 3,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_bom_cost',
    viewName: 'BOM 원가 분석',
    description: 'BOM 품목별 원가 구성(재료비, 노무비, 경비)을 분석하는 뷰',
    domain: '생산',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 1235, erpScreenName: 'BOM 원가 분석' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-01-28',
    accessTargetCount: 2,
    userOverrideCount: 1,
  },
  {
    viewId: 'v_production_order',
    viewName: '생산지시 현황',
    description: '생산지시 등록·진행·완료 현황을 조회하는 뷰',
    domain: '생산',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 1236, erpScreenName: '생산지시 현황' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-02-20',
    accessTargetCount: 3,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_cost_purchase_trend',
    viewName: '구매단가 추이 분석',
    description: '주요 원자재의 구매단가 변동 추이를 분석하는 복합 뷰',
    domain: '생산',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_derived',
    pgmseqList: [
      { pgmseq: 1234, erpScreenName: 'BOM 조회' },
      { pgmseq: 2345, erpScreenName: '구매단가조회' },
    ],
    rlsType: 'mapping_table',
    rlsConfig: {
      mappingTableName: '_tpdbomdeptauthority',
      viewJoinKey: 'item_seq',
      mappingJoinKey: 'itemseq',
      mappingDeptKey: 'deptseq',
      fullAccessValue: '0',
    },
    isActive: true,
    updatedAt: '2026-03-05',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_slip_summary',
    viewName: '전표 요약 조회',
    description: '회계 전표 일별·부서별 요약 데이터',
    domain: '회계',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_derived',
    pgmseqList: [
      { pgmseq: 2001, erpScreenName: '전표 조회' },
      { pgmseq: 2002, erpScreenName: '전표 승인' },
    ],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-01-15',
    accessTargetCount: 1,
    userOverrideCount: 1,
  },
  {
    viewId: 'v_account_balance',
    viewName: '계정별 잔액 현황',
    description: '계정과목별 차변/대변 잔액 현황을 조회하는 뷰',
    domain: '회계',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 3002, erpScreenName: '계정별원장' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-02-03',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_budget_execution',
    viewName: '예산 집행 현황',
    description: '부서별 예산 편성 대비 집행률을 모니터링하는 뷰',
    domain: '회계',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 3003, erpScreenName: '예산집행현황' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-02-17',
    accessTargetCount: 3,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_payroll_summary',
    viewName: '급여 현황 요약',
    description: '월별 급여 지급 내역 및 공제 현황을 요약하는 뷰',
    domain: '인사',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 4001, erpScreenName: '급여현황' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-01-22',
    accessTargetCount: 1,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_employee_master',
    viewName: '사원 마스터',
    description: '사원 기본 정보(부서, 직급, 입사일 등)를 제공하는 뷰',
    domain: '인사',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 4002, erpScreenName: '사원정보조회' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-12',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_attendance_summary',
    viewName: '근태 현황 요약',
    description: '부서별 출근·지각·연차 사용 현황을 요약하는 뷰',
    domain: '인사',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 4003, erpScreenName: '근태현황' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-02-28',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_sales_order',
    viewName: '수주 현황',
    description: '수주 등록·진행·마감 현황을 조회하는 뷰',
    domain: '영업',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 5001, erpScreenName: '수주현황' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-01-30',
    accessTargetCount: 3,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_sales_performance',
    viewName: '영업 실적 분석',
    description: '거래처별·품목별 매출 실적을 분석하는 뷰',
    domain: '영업',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 5002, erpScreenName: '매출실적분석' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-18',
    accessTargetCount: 2,
    userOverrideCount: 1,
  },
  {
    viewId: 'v_purchase_order',
    viewName: '발주 현황',
    description: '발주 등록·입고·검수 현황을 조회하는 뷰',
    domain: '구매',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 6001, erpScreenName: '발주현황' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-02-06',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_vendor_master',
    viewName: '거래처 마스터',
    description: '거래처 기본 정보 및 거래 실적을 제공하는 뷰',
    domain: '구매',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 6002, erpScreenName: '거래처정보' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-01-19',
    accessTargetCount: 4,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_inventory_status',
    viewName: '재고 현황',
    description: '품목별·창고별 현재고 및 가용재고를 조회하는 뷰',
    domain: '물류',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 7001, erpScreenName: '재고현황' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-01',
    accessTargetCount: 3,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_shipment_tracking',
    viewName: '출하 추적',
    description: '출하 지시·진행·완료 현황을 추적하는 뷰',
    domain: '물류',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 7002, erpScreenName: '출하현황' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-02-24',
    accessTargetCount: 3,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_project_status',
    viewName: '프로젝트 진행 현황',
    description: '프로젝트별 일정·비용·진척률을 모니터링하는 뷰',
    domain: '프로젝트',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 8001, erpScreenName: '프로젝트현황' }],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-01-25',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_kpi_dashboard',
    viewName: 'KPI 대시보드',
    description: '경영진 KPI(매출, 영업이익률, 재고회전율 등) 요약 뷰',
    domain: '경영',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_derived',
    pgmseqList: [
      { pgmseq: 5002, erpScreenName: '매출실적분석' },
      { pgmseq: 3002, erpScreenName: '계정별원장' },
      { pgmseq: 7001, erpScreenName: '재고현황' },
    ],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-22',
    accessTargetCount: 1,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_cost_analysis_dept',
    viewName: '부서별 원가 분석',
    description: '부서별 제조원가 구성 및 추이를 분석하는 복합 뷰',
    domain: '생산',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_derived',
    pgmseqList: [
      { pgmseq: 1235, erpScreenName: 'BOM 원가 분석' },
      { pgmseq: 1236, erpScreenName: '생산지시 현황' },
    ],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: false,
    updatedAt: '2026-02-14',
    accessTargetCount: 2,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_hr_cost_trend',
    viewName: '인건비 추이 분석',
    description: '부서별 인건비(급여, 상여, 퇴직급여) 추이를 분석하는 복합 뷰',
    domain: '인사',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_derived',
    pgmseqList: [
      { pgmseq: 4001, erpScreenName: '급여현황' },
      { pgmseq: 4002, erpScreenName: '사원정보조회' },
    ],
    rlsType: 'code_secu',
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-28',
    accessTargetCount: 1,
    userOverrideCount: 1,
  },
  // ── ERP 뷰: 사용자만 케이스 (설계서 예시 ⑥) ─────────────────────────────────
  {
    viewId: 'v_hr_override',
    viewName: '인사 특별 조회',
    description: '특정 사용자에게만 직접 부여된 인사 데이터 조회 뷰',
    domain: '인사',
    sourceType: 'ERP',
    sourceConfig: null,
    authType: 'erp_pgm',
    pgmseqList: [{ pgmseq: 4004, erpScreenName: '인사특별조회' }],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-15',
    accessTargetCount: 0,
    userOverrideCount: 3,
  },
  // ── 비ERP 뷰 (설계서 §2.2 예시 행) ──────────────────────────────────────────
  {
    viewId: 'v_jira_status',
    viewName: 'Jira 이슈 현황',
    description: '개발팀 스프린트 이슈 상태 추적',
    domain: '개발',
    sourceType: 'Jira',
    sourceConfig: {
      jiraUrl: 'https://jira.konachain.com',
      projectKey: 'PROJ',
      jqlQuery: 'project = PROJ AND status != Closed',
      authMethod: 'api_token' as const,
    },
    authType: 'non_erp',
    pgmseqList: [],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-30',
    accessTargetCount: 1,
    userOverrideCount: 2,
  },
  {
    viewId: 'v_sales_targets',
    viewName: '영업 목표 실적',
    description: '분기별 영업팀 목표 대비 실적 추적',
    domain: '영업',
    sourceType: 'Excel',
    sourceConfig: {
      fileName: '영업실적_2026Q1.xlsx',
      sheetName: 'Sheet1',
      headerRow: 1,
    },
    authType: 'non_erp',
    pgmseqList: [],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-03-25',
    accessTargetCount: 0,
    userOverrideCount: 0,
  },
  {
    viewId: 'v_api_metrics',
    viewName: 'API 메트릭스',
    description: '외부 API 기반 운영 메트릭스 데이터 조회',
    domain: '운영',
    sourceType: 'API',
    sourceConfig: {
      endpoint: 'https://api.example.com/v1/data',
      httpMethod: 'GET' as const,
      authMethod: 'bearer' as const,
    },
    authType: 'non_erp',
    pgmseqList: [],
    rlsType: null,
    rlsConfig: null,
    isActive: true,
    updatedAt: '2026-04-01',
    accessTargetCount: 0,
    userOverrideCount: 0,
  },
];

// ── 스키마 ─────────────────────────────────────────────────────────────────────

export const VIEW_SCHEMAS: Record<string, ViewColumn[]> = {
  v_bom_master: [
    { columnName: 'item_seq', dataType: 'int', description: '품목 ID' },
    { columnName: 'item_name', dataType: 'varchar(200)', description: '품목명' },
    { columnName: 'item_code', dataType: 'varchar(50)', description: '품목코드' },
    { columnName: 'parent_item_seq', dataType: 'int', description: '상위 품목 ID' },
    { columnName: 'bom_level', dataType: 'int', description: 'BOM 레벨' },
    { columnName: 'qty', dataType: 'decimal(18,4)', description: '소요량' },
    { columnName: 'unit', dataType: 'varchar(20)', description: '단위' },
    { columnName: 'dept_seq', dataType: 'int', description: '부서 ID' },
    { columnName: 'dept_name', dataType: 'varchar(100)', description: '부서명' },
    { columnName: 'proc_type', dataType: 'varchar(10)', description: '조달구분 (제조/구매)' },
    { columnName: 'lead_time', dataType: 'int', description: '리드타임 (일)' },
    { columnName: 'is_active', dataType: 'bit', description: '사용 여부' },
    { columnName: 'created_at', dataType: 'datetime', description: '등록일시' },
    { columnName: 'modified_at', dataType: 'datetime', description: '수정일시' },
  ],
  v_slip_summary: [
    { columnName: 'slip_date', dataType: 'date', description: '전표일자' },
    { columnName: 'slip_no', dataType: 'varchar(20)', description: '전표번호' },
    { columnName: 'account_code', dataType: 'varchar(10)', description: '계정과목코드' },
    { columnName: 'account_name', dataType: 'varchar(100)', description: '계정과목명' },
    { columnName: 'debit_amount', dataType: 'decimal(18,2)', description: '차변금액' },
    { columnName: 'credit_amount', dataType: 'decimal(18,2)', description: '대변금액' },
    { columnName: 'description', dataType: 'varchar(500)', description: '적요' },
    { columnName: 'dept_seq', dataType: 'int', description: '부서 ID' },
    { columnName: 'dept_name', dataType: 'varchar(100)', description: '부서명' },
    { columnName: 'created_by', dataType: 'varchar(50)', description: '작성자' },
  ],
  v_payroll_summary: [
    { columnName: 'pay_year_month', dataType: 'varchar(7)', description: '급여연월' },
    { columnName: 'emp_seq', dataType: 'int', description: '사원 ID' },
    { columnName: 'emp_name', dataType: 'varchar(100)', description: '사원명' },
    { columnName: 'dept_seq', dataType: 'int', description: '부서 ID' },
    { columnName: 'dept_name', dataType: 'varchar(100)', description: '부서명' },
    { columnName: 'base_salary', dataType: 'decimal(18,0)', description: '기본급' },
    { columnName: 'overtime_pay', dataType: 'decimal(18,0)', description: '시간외수당' },
    { columnName: 'bonus', dataType: 'decimal(18,0)', description: '상여금' },
    { columnName: 'total_deduction', dataType: 'decimal(18,0)', description: '공제합계' },
    { columnName: 'net_pay', dataType: 'decimal(18,0)', description: '실지급액' },
  ],
  v_sales_order: [
    { columnName: 'order_no', dataType: 'varchar(20)', description: '수주번호' },
    { columnName: 'order_date', dataType: 'date', description: '수주일자' },
    { columnName: 'customer_name', dataType: 'varchar(200)', description: '거래처명' },
    { columnName: 'item_name', dataType: 'varchar(200)', description: '품목명' },
    { columnName: 'qty', dataType: 'decimal(18,2)', description: '수주수량' },
    { columnName: 'unit_price', dataType: 'decimal(18,2)', description: '단가' },
    { columnName: 'amount', dataType: 'decimal(18,2)', description: '수주금액' },
    { columnName: 'delivery_date', dataType: 'date', description: '납기일자' },
    { columnName: 'status', dataType: 'varchar(20)', description: '진행상태' },
  ],
};

// 나머지 뷰는 기본 스키마 3컬럼으로 대체
const defaultSchema = (viewId: string): ViewColumn[] => [
  { columnName: 'id', dataType: 'int', description: `${viewId} 기본 키` },
  { columnName: 'name', dataType: 'varchar(200)', description: '명칭' },
  { columnName: 'created_at', dataType: 'datetime', description: '등록일시' },
];

export function getViewSchema(viewId: string): ViewColumn[] {
  return VIEW_SCHEMAS[viewId] ?? defaultSchema(viewId);
}

// ── 데이터 미리보기 ───────────────────────────────────────────────────────────

export const VIEW_DATA_PREVIEWS: Record<string, DataPreview> = {
  v_bom_master: {
    columns: ['item_seq', 'item_name', 'item_code', 'parent_item_seq', 'bom_level', 'qty', 'unit', 'dept_seq', 'dept_name', 'proc_type'],
    rows: [
      { item_seq: 1001, item_name: '완제품 A-100', item_code: 'FG-A100', parent_item_seq: null, bom_level: 0, qty: 1, unit: 'EA', dept_seq: 150, dept_name: '생산기술팀', proc_type: '제조' },
      { item_seq: 2001, item_name: '서브어셈블리 SA-01', item_code: 'SA-01', parent_item_seq: 1001, bom_level: 1, qty: 2, unit: 'EA', dept_seq: 150, dept_name: '생산기술팀', proc_type: '제조' },
      { item_seq: 3001, item_name: '원자재 RM-001', item_code: 'RM-001', parent_item_seq: 2001, bom_level: 2, qty: 5.5, unit: 'KG', dept_seq: 160, dept_name: '구매팀', proc_type: '구매' },
      { item_seq: 3002, item_name: '원자재 RM-002', item_code: 'RM-002', parent_item_seq: 2001, bom_level: 2, qty: 3, unit: 'M', dept_seq: 160, dept_name: '구매팀', proc_type: '구매' },
      { item_seq: 2002, item_name: '부품 PT-10', item_code: 'PT-10', parent_item_seq: 1001, bom_level: 1, qty: 4, unit: 'EA', dept_seq: 150, dept_name: '생산기술팀', proc_type: '구매' },
    ],
  },
  v_slip_summary: {
    columns: ['slip_date', 'slip_no', 'account_code', 'account_name', 'debit_amount', 'credit_amount', 'description', 'dept_name'],
    rows: [
      { slip_date: '2026-03-25', slip_no: 'SL-2026-0325-001', account_code: '4100', account_name: '제품매출', debit_amount: 0, credit_amount: 45000000, description: '3월 매출 계상', dept_name: '영업팀' },
      { slip_date: '2026-03-25', slip_no: 'SL-2026-0325-002', account_code: '1100', account_name: '외상매출금', debit_amount: 45000000, credit_amount: 0, description: '3월 매출 계상', dept_name: '영업팀' },
      { slip_date: '2026-03-24', slip_no: 'SL-2026-0324-001', account_code: '5100', account_name: '원재료비', debit_amount: 12000000, credit_amount: 0, description: '원자재 투입', dept_name: '생산기술팀' },
    ],
  },
};

export function getDataPreview(viewId: string): DataPreview {
  return VIEW_DATA_PREVIEWS[viewId] ?? { columns: ['id', 'name'], rows: [{ id: 1, name: '샘플 데이터' }] };
}

// ── 접근 권한 ──────────────────────────────────────────────────────────────────

// ── 멤버 데이터 (그룹 펼침용) ────────────────────────────────────────────────

const MEMBERS_PRODUCTION = [
  { userId: 'u25', name: '황생산', department: '생산기술팀' },
  { userId: 'u26', name: '추생산', department: '생산관리팀' },
  { userId: 'u24', name: '심SCM', department: 'SCM' },
  { userId: 'm01', name: '김영수', department: '생산기술팀' },
  { userId: 'm02', name: '이민수', department: '생산기술팀' },
  { userId: 'm03', name: '한서연', department: '생산관리팀' },
  { userId: 'm04', name: '최동훈', department: '생산관리팀' },
  { userId: 'm05', name: '장현우', department: '품질관리팀' },
  { userId: 'm06', name: '오정민', department: '생산기술팀' },
  { userId: 'm07', name: '신태호', department: '생산관리팀' },
  { userId: 'm08', name: '조현정', department: '품질관리팀' },
  { userId: 'm09', name: '윤상혁', department: '생산기술팀' },
];

const MEMBERS_EXECUTIVE = [
  { userId: 'u01', name: '김대표', department: '경영지원' },
  { userId: 'u09', name: '강CFO', department: '재무팀' },
  { userId: 'u13', name: '오실장', department: 'DID국내사업실' },
  { userId: 'u20', name: '구부문장', department: '플랫폼운영부문' },
  { userId: 'u23', name: '남부서장', department: '카드영업부' },
];

const MEMBERS_ACCOUNTING = [
  { userId: 'u09', name: '강CFO', department: '재무팀' },
  { userId: 'u10', name: '임재무', department: '재무팀' },
  { userId: 'u11', name: '조회계', department: '회계팀' },
  { userId: 'u12', name: '배세무', department: '회계팀' },
  { userId: 'm10', name: '박경리', department: '회계팀' },
  { userId: 'm11', name: '김결산', department: '재무팀' },
];

const MEMBERS_HR = [
  { userId: 'u07', name: '윤인사', department: 'HR팀' },
  { userId: 'u08', name: '서인사', department: 'HR팀' },
  { userId: 'm12', name: '최인사', department: 'HR팀' },
  { userId: 'm13', name: '강급여', department: 'HR팀' },
];

const MEMBERS_SALES = [
  { userId: 'u13', name: '오실장', department: 'DID국내사업실' },
  { userId: 'u14', name: '노영업', department: 'DID국내사업실' },
  { userId: 'u15', name: '문해외', department: 'DID해외사업실' },
  { userId: 'u21', name: '성Biz', department: 'Biz1그룹' },
  { userId: 'u22', name: '전지원', department: 'Biz지원그룹' },
  { userId: 'u23', name: '남부서장', department: '카드영업부' },
  { userId: 'm14', name: '박영업', department: 'DID국내사업실' },
  { userId: 'm15', name: '김해외', department: 'DID해외사업실' },
  { userId: 'm16', name: '이마케팅', department: 'DID국내사업실' },
  { userId: 'm17', name: '정기획', department: 'Biz1그룹' },
  { userId: 'm18', name: '한영업', department: 'DID국내사업실' },
  { userId: 'm19', name: '조지원', department: 'Biz지원그룹' },
  { userId: 'm20', name: '최카드', department: '카드영업부' },
  { userId: 'm21', name: '강카드', department: '카드영업부' },
  { userId: 'm22', name: '배카드', department: '카드영업부' },
];

// ── 접근 권한 ──────────────────────────────────────────────────────────────────

export const VIEW_ACCESS_TARGETS: Record<string, AccessTarget[]> = {
  // 설계서 예시 ① — 부서 2 + 그룹 1 + 사용자 1 = "부서 2 · 그룹 1 · 1명"
  v_bom_master: [
    { name: '생산기술팀 (150)', type: '부서', basis: '_TCAOrgDeptSecu secu=\'1\'', memberCount: 18, members: [
      { userId: 'm01', name: '김영수', department: '생산기술팀' },
      { userId: 'm02', name: '이민수', department: '생산기술팀' },
      { userId: 'm06', name: '한서연', department: '생산기술팀' },
      { userId: 'm09', name: '윤상혁', department: '생산기술팀' },
      { userId: 'm23', name: '오정민', department: '생산기술팀' },
    ] },
    { name: '품질관리팀 (170)', type: '부서', basis: '_TCAOrgDeptSecu secu=\'1\'', memberCount: 10, members: [
      { userId: 'm05', name: '장현우', department: '품질관리팀' },
      { userId: 'm08', name: '조현정', department: '품질관리팀' },
    ] },
    { name: '생산관리', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-production', memberCount: 12, members: MEMBERS_PRODUCTION },
    { name: '박지은', type: '사용자', basis: '_tcausersecu secu=\'1\' (오버라이드)' },
  ],
  v_bom_cost: [
    { name: '생산기술팀 (150)', type: '부서', basis: '_TCAOrgDeptSecu secu=\'1\'', memberCount: 18, members: [
      { userId: 'm01', name: '김영수', department: '생산기술팀' },
      { userId: 'm02', name: '이민수', department: '생산기술팀' },
    ] },
    { name: '생산관리', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-production', memberCount: 12, members: MEMBERS_PRODUCTION },
    { name: '원가관리', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-cost', memberCount: 3, members: [
      { userId: 'm38', name: '이원가', department: '원가팀' },
      { userId: 'm39', name: '최분석', department: '원가팀' },
      { userId: 'm40', name: '정산출', department: '원가팀' },
    ] },
    { name: '박지은', type: '사용자', basis: '_tcausersecu secu=\'1\' (오버라이드)' },
  ],
  v_cost_purchase_trend: [
    { name: '생산관리', type: '그룹', basis: 'ALL 로직: pgmseq 1234, 2345 모두 허용', groupId: 'grp-production', memberCount: 12, members: MEMBERS_PRODUCTION },
    { name: '임원(사장단)', type: '그룹', basis: 'ALL 로직: pgmseq 1234, 2345 모두 허용', groupId: 'grp-executive', memberCount: 5, members: MEMBERS_EXECUTIVE },
  ],
  // 설계서 예시 ② — 그룹 1 + 사용자 1 = "그룹 1 · 1명" (erp_derived)
  v_slip_summary: [
    { name: '임원(사장단)', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-executive', memberCount: 5, members: MEMBERS_EXECUTIVE },
    { name: '박지은', type: '사용자', basis: '_tcausersecu secu=\'1\' (오버라이드)' },
  ],
  // 설계서 예시 ③ — 그룹 1 = "그룹 1" (민감 데이터, 그룹만)
  v_payroll_summary: [
    { name: '임원(사장단)', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-executive', memberCount: 5, members: MEMBERS_EXECUTIVE },
  ],
  v_sales_order: [
    { name: '영업관리', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-sales', memberCount: 15, members: MEMBERS_SALES },
    { name: '생산관리', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-production', memberCount: 12, members: MEMBERS_PRODUCTION },
    { name: '임원(사장단)', type: '그룹', basis: '_tcagroupsecu secu=\'1\'', groupId: 'grp-executive', memberCount: 5, members: MEMBERS_EXECUTIVE },
  ],
  v_kpi_dashboard: [
    { name: '임원(사장단)', type: '그룹', basis: 'ALL 로직: pgmseq 5002, 3002, 7001 모두 허용', groupId: 'grp-executive', memberCount: 5, members: MEMBERS_EXECUTIVE },
  ],
  // 설계서 예시 ⑥ — 사용자 3 = "3명" (사용자만, ERP)
  v_hr_override: [
    { name: '김영수', type: '사용자', basis: '_tcausersecu secu=\'1\' (오버라이드)' },
    { name: '박지은', type: '사용자', basis: '_tcausersecu secu=\'1\' (오버라이드)' },
    { name: '이대표', type: '사용자', basis: '_tcausersecu secu=\'1\' (오버라이드)' },
  ],
  // ── 비ERP 뷰 접근 권한 ──────────────────────────────────────────────────────
  // 설계서 예시 ④ — 부서 1 + 사용자 2 = "부서 1 · 2명" (비ERP)
  v_jira_status: [
    { name: '개발1팀 (310)', type: '부서', basis: '관리자 직접 설정', memberCount: 8, members: [
      { userId: 'm30', name: '김개발', department: '개발1팀' },
      { userId: 'm31', name: '이개발', department: '개발1팀' },
      { userId: 'm32', name: '박프론트', department: '개발1팀' },
    ] },
    { name: '김철수', type: '사용자', basis: '관리자 직접 설정' },
    { name: '이민수', type: '사용자', basis: '관리자 직접 설정' },
  ],
  // 설계서 예시 ⑤ — 전체 허용 (빈 배열)
  v_sales_targets: [],
  // v_api_metrics: 맵에 키 없음 = 미설정 "—" (설계서 예시 ⑦)
};

export function getAccessTargets(viewId: string): AccessTarget[] {
  return VIEW_ACCESS_TARGETS[viewId] ?? [];
}

/** 목록 컬럼용 허용 대상 요약 문자열을 반환한다. "부서 2 · 그룹 1 · 1명" 형식 */
export function getAccessSummary(viewId: string): string {
  const targets = VIEW_ACCESS_TARGETS[viewId];
  if (targets === undefined) return '—';           // 미설정
  if (targets.length === 0) return '전체 허용';     // 접근 제한 없음
  const d = targets.filter((t) => t.type === '부서').length;
  const g = targets.filter((t) => t.type === '그룹').length;
  const u = targets.filter((t) => t.type === '사용자').length;
  const parts: string[] = [];
  if (d > 0) parts.push(`부서 ${d}`);
  if (g > 0) parts.push(`그룹 ${g}`);
  if (u > 0) parts.push(`${u}명`);
  return parts.join(' · ') || '—';
}

// ── 사용자별 뷰테이블 접근 현황 (관리자 > 사용자 관리 확장용) ──────────────────

export const USER_VIEW_ACCESS: Record<string, UserViewTableAccess[]> = {
  'u25': [ // 황생산 (생산Group, 생산관리 그룹)
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '허용', accessBasis: '생산기술팀(부서) + 생산관리(그룹) 허용', rlsScope: 'dept_seq = 150 (생산기술팀)' },
    { viewId: 'v_bom_cost', viewName: 'BOM 원가 분석', accessStatus: '차단', accessBasis: '생산관리 그룹 차단 (secu=\'2\')', rlsScope: null },
    { viewId: 'v_production_order', viewName: '생산지시 현황', accessStatus: '허용', accessBasis: '생산기술팀(부서) + 생산관리(그룹) 허용', rlsScope: 'dept_seq = 150' },
    {
      viewId: 'v_cost_purchase_trend', viewName: '구매단가 추이 분석', accessStatus: '허용', accessBasis: 'ALL 로직 통과',
      rlsScope: 'dept_seq = 150 (생산기술팀)',
      derivedDetail: [
        { pgmseq: 1234, erpScreenName: 'BOM 조회', accessStatus: '허용', basis: '생산기술팀(부서) + 생산관리(그룹) 허용' },
        { pgmseq: 2345, erpScreenName: '구매단가조회', accessStatus: '허용', basis: '생산기술팀(부서) + 생산관리(그룹) 허용' },
      ],
    },
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_account_balance', viewName: '계정별 잔액 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_budget_execution', viewName: '예산 집행 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_employee_master', viewName: '사원 마스터', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_attendance_summary', viewName: '근태 현황 요약', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_sales_order', viewName: '수주 현황', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: null },
    { viewId: 'v_sales_performance', viewName: '영업 실적 분석', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_purchase_order', viewName: '발주 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_vendor_master', viewName: '거래처 마스터', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: null },
    { viewId: 'v_inventory_status', viewName: '재고 현황', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: 'dept_seq = 150' },
    { viewId: 'v_shipment_tracking', viewName: '출하 추적', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: null },
    { viewId: 'v_project_status', viewName: '프로젝트 진행 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    {
      viewId: 'v_cost_analysis_dept', viewName: '부서별 원가 분석', accessStatus: '허용', accessBasis: 'ALL 로직 통과',
      rlsScope: 'dept_seq = 150',
      derivedDetail: [
        { pgmseq: 1235, erpScreenName: 'BOM 원가 분석', accessStatus: '허용', basis: '생산관리 그룹 허용' },
        { pgmseq: 1236, erpScreenName: '생산지시 현황', accessStatus: '허용', basis: '생산관리 그룹 허용' },
      ],
    },
    { viewId: 'v_hr_cost_trend', viewName: '인건비 추이 분석', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_hr_override', viewName: '인사 특별 조회', accessStatus: '허용', accessBasis: '사용자 직접 부여 (오버라이드)', rlsScope: null },
    { viewId: 'v_jira_status', viewName: 'Jira 이슈 현황', accessStatus: '허용', accessBasis: '생산기술팀(부서) 허용', rlsScope: null },
    { viewId: 'v_sales_targets', viewName: '영업 목표 실적', accessStatus: '허용', accessBasis: '전체 허용', rlsScope: null },
    { viewId: 'v_api_metrics', viewName: 'API 메트릭스', accessStatus: '차단', accessBasis: '미설정', rlsScope: null },
  ],
  'u01': [ // 김대표 (경영지원, 임원(사장단) 그룹)
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_bom_cost', viewName: 'BOM 원가 분석', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_account_balance', viewName: '계정별 잔액 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_budget_execution', viewName: '예산 집행 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '허용', accessBasis: '사용자 오버라이드 허용', rlsScope: null },
    { viewId: 'v_employee_master', viewName: '사원 마스터', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_sales_order', viewName: '수주 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_sales_performance', viewName: '영업 실적 분석', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_inventory_status', viewName: '재고 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_shipment_tracking', viewName: '출하 추적', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_project_status', viewName: '프로젝트 진행 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_hr_cost_trend', viewName: '인건비 추이 분석', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
  ],
  'u09': [ // 강CFO (재무팀, 임원+회계관리 그룹)
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '허용', accessBasis: '회계관리 그룹 허용', rlsScope: null },
    { viewId: 'v_account_balance', viewName: '계정별 잔액 현황', accessStatus: '허용', accessBasis: '회계관리 그룹 허용', rlsScope: null },
    { viewId: 'v_budget_execution', viewName: '예산 집행 현황', accessStatus: '허용', accessBasis: '회계관리 그룹 허용', rlsScope: null },
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_bom_cost', viewName: 'BOM 원가 분석', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_production_order', viewName: '생산지시 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_employee_master', viewName: '사원 마스터', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_sales_order', viewName: '수주 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_sales_performance', viewName: '영업 실적 분석', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    {
      viewId: 'v_hr_cost_trend', viewName: '인건비 추이 분석', accessStatus: '허용', accessBasis: 'ALL 로직 통과',
      rlsScope: null,
      derivedDetail: [
        { pgmseq: 3003, erpScreenName: '경영분석 조회', accessStatus: '허용', basis: '회계관리 그룹 허용' },
        { pgmseq: 4003, erpScreenName: '인건비 조회', accessStatus: '허용', basis: '임원(사장단) 그룹 허용' },
      ],
    },
    { viewId: 'v_jira_status', viewName: 'Jira 이슈 현황', accessStatus: '차단', accessBasis: '권한 없음', rlsScope: null },
    { viewId: 'v_sales_targets', viewName: '영업 목표 실적', accessStatus: '허용', accessBasis: '전체 허용', rlsScope: null },
    { viewId: 'v_api_metrics', viewName: 'API 메트릭스', accessStatus: '허용', accessBasis: '재무팀(부서) 허용', rlsScope: null },
  ],
  'u07': [ // 윤인사 (HR팀, 인사관리 그룹)
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '허용', accessBasis: '인사관리 그룹 허용', rlsScope: 'dept_seq = 200 (HR팀)' },
    { viewId: 'v_employee_master', viewName: '사원 마스터', accessStatus: '허용', accessBasis: '인사관리 그룹 허용', rlsScope: 'dept_seq = 200 (HR팀)' },
    { viewId: 'v_attendance_summary', viewName: '근태 현황 요약', accessStatus: '허용', accessBasis: '인사관리 그룹 허용', rlsScope: 'dept_seq = 200 (HR팀)' },
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_sales_order', viewName: '수주 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_purchase_order', viewName: '발주 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
  ],
  'u13': [ // 오실장 (DID국내사업실, 임원+영업관리 그룹)
    { viewId: 'v_sales_order', viewName: '수주 현황', accessStatus: '허용', accessBasis: '영업관리 그룹 허용', rlsScope: null },
    { viewId: 'v_sales_performance', viewName: '영업 실적 분석', accessStatus: '허용', accessBasis: '영업관리 그룹 허용', rlsScope: null },
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_account_balance', viewName: '계정별 잔액 현황', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '허용', accessBasis: '임원(사장단) 그룹 허용', rlsScope: null },
    {
      viewId: 'v_cost_purchase_trend', viewName: '구매단가 추이 분석', accessStatus: '허용', accessBasis: 'ALL 로직 통과',
      rlsScope: null,
      derivedDetail: [
        { pgmseq: 1234, erpScreenName: 'BOM 조회', accessStatus: '허용', basis: '임원(사장단) 그룹 허용' },
        { pgmseq: 2345, erpScreenName: '구매단가조회', accessStatus: '허용', basis: '영업관리 그룹 허용' },
      ],
    },
    { viewId: 'v_production_order', viewName: '생산지시 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_purchase_order', viewName: '발주 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
  ],
  'u24': [ // 심SCM (SCM, 생산관리+구매관리 그룹)
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: 'dept_seq = 300 (SCM)' },
    { viewId: 'v_production_order', viewName: '생산지시 현황', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: 'dept_seq = 300' },
    { viewId: 'v_purchase_order', viewName: '발주 현황', accessStatus: '허용', accessBasis: '구매관리 그룹 허용', rlsScope: null },
    { viewId: 'v_vendor_master', viewName: '거래처 마스터', accessStatus: '허용', accessBasis: '구매관리 그룹 허용', rlsScope: null },
    { viewId: 'v_inventory_status', viewName: '재고 현황', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: 'dept_seq = 300 (SCM)' },
    { viewId: 'v_shipment_tracking', viewName: '출하 추적', accessStatus: '허용', accessBasis: '생산관리 그룹 허용', rlsScope: null },
    {
      viewId: 'v_cost_purchase_trend', viewName: '구매단가 추이 분석', accessStatus: '허용', accessBasis: 'ALL 로직 통과',
      rlsScope: 'dept_seq = 300 (SCM)',
      derivedDetail: [
        { pgmseq: 1234, erpScreenName: 'BOM 조회', accessStatus: '허용', basis: '생산관리 그룹 허용' },
        { pgmseq: 2345, erpScreenName: '구매단가조회', accessStatus: '허용', basis: '구매관리 그룹 허용' },
      ],
    },
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_sales_performance', viewName: '영업 실적 분석', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
  ],
  'u02': [ // 박기획 (경영기획실, 회계관리 그룹)
    { viewId: 'v_slip_summary', viewName: '전표 요약 조회', accessStatus: '허용', accessBasis: '회계관리 그룹 허용', rlsScope: null },
    { viewId: 'v_account_balance', viewName: '계정별 잔액 현황', accessStatus: '허용', accessBasis: '회계관리 그룹 허용', rlsScope: null },
    { viewId: 'v_budget_execution', viewName: '예산 집행 현황', accessStatus: '허용', accessBasis: '회계관리 그룹 허용', rlsScope: null },
    { viewId: 'v_kpi_dashboard', viewName: 'KPI 대시보드', accessStatus: '허용', accessBasis: '사용자 오버라이드 허용', rlsScope: null },
    {
      viewId: 'v_hr_cost_trend', viewName: '인건비 추이 분석', accessStatus: '허용', accessBasis: 'ALL 로직 통과',
      rlsScope: null,
      derivedDetail: [
        { pgmseq: 3003, erpScreenName: '경영분석 조회', accessStatus: '허용', basis: '회계관리 그룹 허용' },
        { pgmseq: 4003, erpScreenName: '인건비 조회', accessStatus: '차단', basis: '인사관리 그룹 권한 없음' },
      ],
    },
    { viewId: 'v_bom_master', viewName: 'BOM 마스터 조회', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_production_order', viewName: '생산지시 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_payroll_summary', viewName: '급여 현황 요약', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
    { viewId: 'v_sales_order', viewName: '수주 현황', accessStatus: '차단', accessBasis: '그룹 권한 없음', rlsScope: null },
  ],
};

export function getUserViewAccess(userId: string): UserViewTableAccess[] {
  return USER_VIEW_ACCESS[userId] ?? [];
}

// ── RLS 상세 표시 정보 ──────────────────────────────────────────────────────

const CODE_SECU_RLS_INFO: Record<string, CodeSecuRlsDisplay> = {
  v_bom_cost: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_production_order: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_slip_summary: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_budget_execution: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_employee_master: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_attendance_summary: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_sales_performance: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_inventory_status: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_project_status: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_cost_analysis_dept: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
  v_hr_cost_trend: { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' },
};

export function getCodeSecuRlsInfo(viewId: string): CodeSecuRlsDisplay {
  return CODE_SECU_RLS_INFO[viewId] ?? { codeSecuGroupName: '부서', filterColumn: 'DeptSeq' };
}

const VIEW_RLS_EXAMPLES: Record<string, ViewRlsExample> = {
  // mapping_table 뷰
  v_bom_master: {
    userName: '김영수', department: '생산기술팀', deptSeq: 150,
    steps: [
      '_tpdbomdeptauthority에서 deptseq=150 또는 deptseq=0인 itemseq 목록 조회',
      '뷰의 item_seq IN (해당 목록) 필터 적용',
      '생산기술팀에 배정된 BOM 품목만 조회',
    ],
  },
  v_cost_purchase_trend: {
    userName: '황생산', department: '생산기술팀', deptSeq: 150,
    steps: [
      '_tpdbomdeptauthority에서 deptseq=150 또는 deptseq=0인 itemseq 목록 조회',
      '뷰의 item_seq IN (해당 목록) 필터 적용',
      '생산기술팀에 배정된 품목의 구매단가 추이만 조회',
    ],
  },
  // code_secu 뷰
  v_bom_cost: {
    userName: '황생산', department: '생산기술팀', deptSeq: 150,
    allowedValues: [{ seq: 150, name: '생산기술팀' }, { seq: 160, name: '생산관리팀' }],
  },
  v_production_order: {
    userName: '김영수', department: '생산기술팀', deptSeq: 150,
    allowedValues: [{ seq: 150, name: '생산기술팀' }, { seq: 170, name: '품질관리팀' }],
  },
  v_slip_summary: {
    userName: '강CFO', department: '재무팀', deptSeq: 210,
    allowedValues: [{ seq: 210, name: '재무팀' }, { seq: 220, name: '회계팀' }],
  },
  v_budget_execution: {
    userName: '강CFO', department: '재무팀', deptSeq: 210,
    allowedValues: [{ seq: 210, name: '재무팀' }, { seq: 220, name: '회계팀' }],
  },
  v_employee_master: {
    userName: '윤인사', department: 'HR팀', deptSeq: 200,
    allowedValues: [{ seq: 200, name: 'HR팀' }],
  },
  v_attendance_summary: {
    userName: '윤인사', department: 'HR팀', deptSeq: 200,
    allowedValues: [{ seq: 200, name: 'HR팀' }],
  },
  v_sales_performance: {
    userName: '오실장', department: 'DID국내사업실', deptSeq: 400,
    allowedValues: [{ seq: 400, name: 'DID국내사업실' }, { seq: 410, name: 'DID해외사업실' }],
  },
  v_inventory_status: {
    userName: '심SCM', department: 'SCM', deptSeq: 300,
    allowedValues: [{ seq: 300, name: 'SCM' }, { seq: 150, name: '생산기술팀' }],
  },
  v_project_status: {
    userName: '김대표', department: '경영지원', deptSeq: 100,
    allowedValues: [{ seq: 100, name: '경영지원' }, { seq: 110, name: '경영기획실' }],
  },
  v_cost_analysis_dept: {
    userName: '황생산', department: '생산기술팀', deptSeq: 150,
    allowedValues: [{ seq: 150, name: '생산기술팀' }, { seq: 160, name: '생산관리팀' }],
  },
  v_hr_cost_trend: {
    userName: '윤인사', department: 'HR팀', deptSeq: 200,
    allowedValues: [{ seq: 200, name: 'HR팀' }],
  },
};

export function getRlsExample(viewId: string): ViewRlsExample | null {
  return VIEW_RLS_EXAMPLES[viewId] ?? null;
}

// ── 접근 권한 미리보기 (다이얼로그용) ─────────────────────────────────────────

export function getAccessPreview(pgmseqs: number[]) {
  const groupMap: Record<number, string[]> = {
    2001: ['회계관리', '임원(사장단)'],
    2002: ['회계관리', '임원(사장단)'],
    1234: ['생산관리', '품질관리', '임원(사장단)'],
    1235: ['생산관리', '원가관리'],
    1236: ['생산관리', '품질관리', '임원(사장단)'],
    2345: ['생산관리', '구매관리', '임원(사장단)'],
    3001: ['회계관리', '임원(사장단)'],
    3002: ['회계관리', '임원(사장단)'],
    3003: ['회계관리', '경영기획', '임원(사장단)'],
    4001: ['인사관리'],
    4002: ['인사관리', '임원(사장단)'],
    4003: ['인사관리', '임원(사장단)'],
    5001: ['영업관리', '생산관리', '임원(사장단)'],
    5002: ['영업관리', '임원(사장단)'],
    6001: ['구매관리', '생산관리'],
    6002: ['구매관리', '영업관리', '생산관리', '임원(사장단)'],
    7001: ['물류관리', '생산관리', '임원(사장단)'],
    7002: ['물류관리', '영업관리', '임원(사장단)'],
    8001: ['프로젝트관리', '임원(사장단)'],
  };

  if (pgmseqs.length === 0) return { groups: [], userOverrides: [] };

  const groupSets = pgmseqs.map((p) => new Set(groupMap[p] ?? []));
  // ALL 로직: 모든 pgmseq에 허용된 그룹만
  const intersection = [...groupSets[0]].filter((g) =>
    groupSets.every((s) => s.has(g)),
  );

  return { groups: intersection, userOverrides: [] };
}
