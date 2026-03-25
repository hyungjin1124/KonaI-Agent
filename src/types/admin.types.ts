// ============================================================================
// Admin Data Access Control Types
// Based on: Kona_Agent_데이터접근권한_통합기획서.xlsx
// 15 roles × 20 modules × 43 subcategories × 345 views
// ============================================================================

// ---------------------------------------------------------------------------
// 1. Domain Roles (시트 ①)
// ---------------------------------------------------------------------------

export type DomainRole =
  | 'ROLE_SYS_ADMIN'
  | 'ROLE_FIN_ADMIN'
  | 'ROLE_FIN_USER'
  | 'ROLE_SALES_MGR'
  | 'ROLE_SALES_USER'
  | 'ROLE_PURCH_USER'
  | 'ROLE_PROD_MGR'
  | 'ROLE_PROD_USER'
  | 'ROLE_LOG_USER'
  | 'ROLE_PJT_MGR'
  | 'ROLE_HR_ADMIN'
  | 'ROLE_HR_USER'
  | 'ROLE_EXEC'
  | 'ROLE_DEPT_MGR'
  | 'ROLE_VIEWER';

export const DOMAIN_ROLES: readonly DomainRole[] = [
  'ROLE_SYS_ADMIN', 'ROLE_FIN_ADMIN', 'ROLE_FIN_USER',
  'ROLE_SALES_MGR', 'ROLE_SALES_USER', 'ROLE_PURCH_USER',
  'ROLE_PROD_MGR', 'ROLE_PROD_USER', 'ROLE_LOG_USER',
  'ROLE_PJT_MGR', 'ROLE_HR_ADMIN', 'ROLE_HR_USER',
  'ROLE_EXEC', 'ROLE_DEPT_MGR', 'ROLE_VIEWER',
] as const;

export type DataScopeType =
  | 'All'
  | 'Division'
  | 'Department'
  | 'Plant'
  | 'Plant+Line'
  | 'Warehouse'
  | 'Project'
  | 'Self'
  // Short aliases used by user-management module
  | 'Div'
  | 'Dept'
  | 'Pjt'
  | 'PlantLine'
  | 'WH';

export interface RoleDefinition {
  role: DomainRole;
  nameKo: string;
  nameEn: string;
  description: string;
  dataScope: DataScopeType;
  note?: string;
}

// ---------------------------------------------------------------------------
// 2. ERP Module & View Subcategory (시트 ②)
// ---------------------------------------------------------------------------

export type ModuleCode =
  | 'AC' | 'CFS' | 'SL' | 'AP' | 'CF' | 'CR' | 'PU' | 'TA'
  | 'PD' | 'LG' | 'PJ' | 'HR' | 'PR' | 'DA' | 'ESM' | 'ABC'
  | 'EIS' | 'BNK' | 'KOD';

export interface ModuleDefinition {
  code: ModuleCode;
  name: string;
  subcategoryCount: number;
}

export type SensitivityLevel = '매우높음' | '높음' | '중간' | '낮음';

export type AccessLevel =
  | 'full'            // ● 전체접근
  | 'dept_restricted' // ◐ 부서/조직 제한
  | 'summary_only'    // ○ 요약만
  | 'no_access'       // — 접근불가
  | 'column_masked';  // 🔒 컬럼마스킹 적용

export interface ViewSubcategory {
  id: string;
  moduleCode: ModuleCode;
  subcategoryName: string;
  viewCount: number;
  sensitivityLevel: SensitivityLevel;
}

export interface ViewDefinition {
  id: string;              // e.g., 'mv_slip_universal'
  subcategoryId: string;   // FK → ViewSubcategory.id
  viewName: string;        // technical name
  displayName: string;     // Korean label
}

// ---------------------------------------------------------------------------
// 4. Access Matrix (시트 ②)
// ---------------------------------------------------------------------------

export interface DomainAccessMatrix {
  role: DomainRole;
  subcategoryAccess: Record<string, AccessLevel>; // subcategoryId → AccessLevel
  viewOverrides: Record<string, AccessLevel>;     // viewId → AccessLevel (override only)
}

// ---------------------------------------------------------------------------
// 5. RLS — Row-Level Security (시트 ⑤)
// ---------------------------------------------------------------------------

export type RlsFilterBase =
  | 'dept_code'
  | 'division_code'
  | 'sales_dept_code'
  | 'plant_code'
  | 'plant_line_code'
  | 'wh_code'
  | 'project_code'
  | 'user_id'
  | 'none';

export interface DomainRowFilterRule {
  id: string;
  role: DomainRole;
  filterBase: RlsFilterBase;
  filterColumn: string;
  sqlWherePattern: string;
  targetViewGroups: string;
  example: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// 6. Column Masking (시트 ⑥)
// ---------------------------------------------------------------------------

export type MaskingType = 'full' | 'partial' | 'hidden';

export type SensitiveColumnCategory =
  | 'salary_bonus'
  | 'ssn'
  | 'bank_account'
  | 'unit_cost'
  | 'vendor_contact'
  | 'employee_pii';

export interface DomainColumnMaskPolicy {
  id: string;
  category: SensitiveColumnCategory;
  categoryName: string;
  targetViews: string;
  maskingRule: string;
  exposedRoles: DomainRole[];
  maskedRoles: string; // descriptive, e.g. "기타 전체"
  resultExample: string;
}

// ---------------------------------------------------------------------------
// 7. Conflict Resolution (시트 ⑦)
// ---------------------------------------------------------------------------

export interface ResolvedEffectivePolicy {
  subcategoryAccess: Record<string, AccessLevel>;
  rowScope: DataScopeType;
  rowFilters: string[];
  columnMasking: Record<SensitiveColumnCategory, MaskingType>;
  auditWarning: boolean;
}

// ---------------------------------------------------------------------------
// 7-1. Permission Audit Log
// ---------------------------------------------------------------------------

export type PermissionAuditAction =
  | 'access_change'
  | 'view_override'
  | 'role_delete'
  | 'rls_change'
  | 'mask_change'
  | 'role_change'
  | 'mapping_change'
  | 'save'
  | 'reset';

export interface PermissionAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: PermissionAuditAction;
  target: string;
  detail: string;
  oldValue?: string;
  newValue?: string;
}

// ---------------------------------------------------------------------------
// 8. Organization & User (시트 ③)
// ---------------------------------------------------------------------------

export interface OrgNode {
  id: string;
  name: string;
  division: string;
  subOrg: string;
}

// ---------------------------------------------------------------------------
// 9. Domain Role Definitions (사용자 관리 모듈)
// ---------------------------------------------------------------------------

export type RoleDomain = 'exec' | 'fin' | 'hr' | 'sales' | 'pjt' | 'prod' | 'scm' | 'sys';

export interface DomainRoleDefinition {
  code: DomainRole;
  displayName: string;
  domain: RoleDomain;
  description: string;
  color: string; // Tailwind color token
}

export type OrgTier = 'division' | 'section' | 'unit';

export interface HierarchicalOrgNode {
  id: string;
  code: string;
  name: string;
  tier: OrgTier;
  parentId: string | null;
  children?: HierarchicalOrgNode[];
}

export type PositionLevel = '실무자' | '관리자' | '임원';

export interface OrgRoleMapping {
  id: string;
  category: string;
  division: string;
  subOrg: string;
  positionTitle: string;
  positionLevel: PositionLevel;
  primaryRole: DomainRole;
  additionalRole?: DomainRole;
  dataAccessScope: string;
  accessModules: string;
  rlsFilter: string;
  note?: string;
}

// UserStatus is re-used from common.types.ts
import type { UserStatus } from './common.types';

export interface EnhancedUser {
  id: string;
  name: string;
  email: string;
  department: string;
  division: string;
  position: string;
  positionLevel?: PositionLevel;
  roles: DomainRole[];
  status: UserStatus;
  lastLogin: string;
  avatarColor?: string;
  orgNodeId?: string;
  orgPath?: string;
}
