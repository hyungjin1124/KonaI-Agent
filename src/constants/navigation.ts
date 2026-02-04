import { ViewType } from '../types';

export interface NavItem {
  id: string;
  label: string;
  iconName: 'LayoutDashboard' | 'Database' | 'UserCog' | 'History' | 'Settings' | 'Cpu' | 'MessageSquare';
  viewType: ViewType;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

export interface DropdownItem {
  id: string;
  label: string;
  iconName: string;
  viewType: ViewType;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    viewType: 'dashboard',
  },
  {
    id: 'general-chat',
    label: '채팅',
    iconName: 'MessageSquare',
    viewType: 'general-chat',
  },
  {
    id: 'data',
    label: 'Data Management',
    iconName: 'Database',
    viewType: 'data',
  },
  {
    id: 'admin',
    label: 'Admin',
    iconName: 'UserCog',
    viewType: 'admin',
  },
  {
    id: 'history',
    label: 'Chat History',
    iconName: 'History',
    viewType: 'history',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'Settings',
    viewType: 'skills',
    hasDropdown: true,
    dropdownItems: [
      { id: 'skills', label: 'Skill 관리', iconName: 'Cpu', viewType: 'skills' },
    ],
  },
];

export const TIME_FILTER_OPTIONS = ['일간', '주간', '월간', '연간'] as const;
export type TimeFilterOption = (typeof TIME_FILTER_OPTIONS)[number];

// Helper to get view type from nav item id
export const getViewTypeFromNavId = (navId: string): ViewType => {
  const navItem = NAV_ITEMS.find((item) => item.id === navId);
  return navItem?.viewType ?? 'dashboard';
};

// Helper to get nav item from view type
export const getNavItemFromViewType = (viewType: ViewType): NavItem | undefined => {
  return NAV_ITEMS.find((item) => item.viewType === viewType);
};
