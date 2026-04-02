// ── 데이터 메뉴 타입 정의 ─────────────────────────────────────────────────────

export type ViewTableDomain =
  | '생산'
  | '회계'
  | '인사'
  | '영업'
  | '구매'
  | '물류'
  | '프로젝트'
  | '경영'
  | '개발'
  | '운영';

export type AuthType = 'erp_pgm' | 'erp_derived' | 'non_erp';

export type RlsType = 'code_secu' | 'mapping_table' | null;

export type SourceType = 'ERP' | 'Jira' | 'Excel' | 'API' | '기타';

// ── 비ERP 소스 설정 ──────────────────────────────────────────────────────────

export interface JiraSourceConfig {
  jiraUrl: string;
  projectKey: string;
  jqlQuery: string;
  authMethod: 'api_token' | 'oauth';
  authCredential?: string;
}

export interface ExcelSourceConfig {
  fileName: string;
  sheetName: string;
  headerRow: number;
}

export interface ApiSourceConfig {
  endpoint: string;
  httpMethod: 'GET' | 'POST';
  authMethod: 'bearer' | 'basic' | '기타';
  authCredential?: string;
  requestBody?: string;
  responseMapping?: string;
}

export interface EtcSourceConfig {
  description: string;
  owner: string;
}

export type SourceConfig =
  | JiraSourceConfig
  | ExcelSourceConfig
  | ApiSourceConfig
  | EtcSourceConfig
  | null;

// ── 뷰테이블 ──────────────────────────────────────────────────────────────────

export interface PgmseqMapping {
  pgmseq: number;
  erpScreenName: string;
}

export interface MappingTableRlsConfig {
  mappingTableName: string;
  viewJoinKey: string;
  mappingJoinKey: string;
  mappingDeptKey: string;
  fullAccessValue: string;
}

export interface ViewTable {
  viewId: string;
  viewName: string;
  description: string;
  domain: ViewTableDomain;
  sourceType: SourceType;
  sourceConfig: SourceConfig;
  authType: AuthType;
  pgmseqList: PgmseqMapping[];
  rlsType: RlsType;
  rlsConfig: MappingTableRlsConfig | null;
  isActive: boolean;
  updatedAt: string;
  accessTargetCount: number;
  userOverrideCount: number;
  /** 목록 컬럼용 요약: "부서 2 · 그룹 1 · 1명" / "전체 허용" / "—" */
  accessSummary?: string;
}

// ── 스키마 ────────────────────────────────────────────────────────────────────

export interface ViewColumn {
  columnName: string;
  dataType: string;
  description: string;
}

// ── 접근 권한 ──────────────────────────────────────────────────────────────────

export type AccessTargetType = '부서' | '그룹' | '사용자';

export interface AccessTargetMember {
  userId: string;
  name: string;
  department: string;
}

export interface AccessTarget {
  name: string;
  type: AccessTargetType;
  basis: string;
  groupId?: string;
  memberCount?: number;
  members?: AccessTargetMember[];
}

// ── 데이터 미리보기 ───────────────────────────────────────────────────────────

export interface DataPreviewRow {
  [key: string]: string | number | null;
}

export interface DataPreview {
  columns: string[];
  rows: DataPreviewRow[];
}

// ── 폼 다이얼로그 ─────────────────────────────────────────────────────────────

/** 비ERP 소스 등록/수정 폼 데이터 */
export type NonErpSourceType = Exclude<SourceType, 'ERP'>;

export interface NonErpFormData {
  viewId: string;
  viewName: string;
  description: string;
  sourceType: NonErpSourceType;
  sourceConfig: SourceConfig;
  domain: ViewTableDomain;
  isActive: boolean;
}

// ── RLS 상세 표시 (접근 권한 탭용) ──────────────────────────────────────────

export interface CodeSecuRlsDisplay {
  codeSecuGroupName: string;   // _TCACodeSecuType 그룹명 (예: "부서")
  filterColumn: string;         // 필터 대상 컬럼 (예: "DeptSeq")
}

export interface ViewRlsExample {
  userName: string;
  department: string;
  deptSeq: number;
  /** code_secu: 사용자에게 허용된 코드값 목록 */
  allowedValues?: { seq: number; name: string }[];
  /** mapping_table: 적용 과정 단계별 설명 */
  steps?: string[];
}

// ── 사용자별 뷰테이블 접근 현황 ──────────────────────────────────────────────

export type UserAccessStatus = '허용' | '차단';
export type AccessStatusFilter = '전체' | '허용' | '차단';

export interface DerivedAccessDetail {
  pgmseq: number;
  erpScreenName: string;
  accessStatus: UserAccessStatus;
  basis: string;
}

export interface UserViewTableAccess {
  viewId: string;
  viewName: string;
  accessStatus: UserAccessStatus;
  accessBasis: string;
  rlsScope: string | null;
  derivedDetail?: DerivedAccessDetail[];
}
