import React from 'react';

// View Types
export type ViewType = 'chat' | 'dashboard' | 'data' | 'skills' | 'admin' | 'history' | 'general-chat';

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
