import { ViewType } from '../types';

export interface NavItem {
  id: string;
  label: string;
  iconName: 'LayoutDashboard' | 'Database' | 'UserCog' | 'History' | 'Settings' | 'Cpu' | 'MessageSquare' | 'Building2' | 'Zap';
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
    label: '대시보드',
    iconName: 'LayoutDashboard',
    viewType: 'dashboard',
  },
  {
    id: 'general-chat',
    label: 'AI 채팅',
    iconName: 'MessageSquare',
    viewType: 'general-chat',
  },
  {
    id: 'skills',
    label: '스킬',
    iconName: 'Cpu',
    viewType: 'skills',
  },
  {
    id: 'data',
    label: '데이터 관리',
    iconName: 'Database',
    viewType: 'data',
  },
  {
    id: 'admin',
    label: '관리자',
    iconName: 'UserCog',
    viewType: 'admin',
  },
  {
    id: 'platform-admin',
    label: '플랫폼 관리',
    iconName: 'Building2',
    viewType: 'platform-admin',
  },
  {
    id: 'history',
    label: '대화 이력',
    iconName: 'History',
    viewType: 'history',
  },
  {
    id: 'settings',
    label: '설정',
    iconName: 'Settings',
    viewType: 'skills',
    hasDropdown: true,
    dropdownItems: [
      { id: 'agent-config', label: '에이전트 설정', iconName: 'Bot', viewType: 'agent-config' },
      { id: 'prompt-management', label: '프롬프트 관리', iconName: 'Sparkles', viewType: 'prompt-management' },
      { id: 'scheduled-tasks', label: '예약 작업', iconName: 'Clock', viewType: 'scheduled-tasks' },
      { id: 'marketplace', label: '마켓플레이스', iconName: 'Store', viewType: 'marketplace' },
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
