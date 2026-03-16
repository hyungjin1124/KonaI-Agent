import React from 'react';

// View Types
export type ViewType = 'chat' | 'dashboard' | 'data' | 'skills' | 'admin' | 'history' | 'general-chat' | 'agent-config' | 'prompt-management' | 'scheduled-tasks' | 'marketplace';

// Sidebar Types
export interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

export interface ActionChip {
  icon: React.ReactNode;
  label: string;
  iconColor?: string;
}

// --- Admin & User Management Types ---

export type UserRole = 'Super Admin' | 'Data Manager' | 'Viewer';
export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  avatarColor?: string;
}

export interface Permission {
  id: string;
  resource: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RoleConfig {
  role: UserRole;
  description: string;
  permissions: Permission[];
  dataScope: 'All' | 'Department' | 'Self';
}

// --- 3-Layer Data Access Control Types ---

// Layer 1: 테이블 수준 접근
export interface ErpViewTable {
  id: string;
  name: string;
  displayName: string;
  category: string;
  description: string;
}

export interface TableAccessPolicy {
  role: UserRole;
  allowedTableIds: string[];
}

// Layer 2: 행 수준 보안
export type OrgAttributeType = '부서코드' | '사업영역' | '법인코드';

export interface OrgUnit {
  id: string;
  code: string;
  name: string;
  type: OrgAttributeType;
}

export interface RowFilterRule {
  id: string;
  role: UserRole;
  attributeType: OrgAttributeType;
  allowedOrgUnitIds: string[];
  description: string;
}

// Layer 3: 컬럼 마스킹
export type MaskingType = 'full' | 'partial' | 'hidden';

export interface ColumnMaskPolicy {
  id: string;
  tableId: string;
  columnName: string;
  columnDisplayName: string;
  sensitivity: 'high' | 'medium' | 'low';
  maskingRules: {
    role: UserRole;
    maskingType: MaskingType;
    maskingExample: string;
  }[];
}
