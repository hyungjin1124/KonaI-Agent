'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  UserCog,
  History,
  Bell,
  Cpu,
  MessageSquare,
} from './icons';
import { ViewType } from '../types';
import { useNotification, Anomaly } from '../context/NotificationContext';
import NotificationPopup from './NotificationPopup';
import ProfileDropdown from './ProfileDropdown';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from './ui/tooltip';



// ViewType → pathname mapping
const VIEW_TO_PATH: Record<string, string> = {
  dashboard: '/',
  chat: '/',
  'general-chat': '/chat',
  data: '/data',
  admin: '/admin',
  history: '/history',
  skills: '/skills',
};

// pathname → ViewType mapping for active state
function pathnameToViewType(pathname: string): ViewType {
  if (pathname === '/') return 'dashboard';
  if (pathname === '/chat') return 'general-chat';
  if (pathname === '/data') return 'data';
  if (pathname === '/admin') return 'admin';
  if (pathname === '/history') return 'history';
  if (pathname === '/skills') return 'skills';
  if (pathname.startsWith('/agent')) return 'chat';
  return 'dashboard';
}

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentView?: ViewType;
  onNavigate?: (view: ViewType) => void;
  onAnomalyClick?: (anomaly: Anomaly) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAnomalyClick, onLogout }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentView = pathnameToViewType(pathname);

  const navigate = (view: string) => {
    const path = VIEW_TO_PATH[view] || '/';
    router.push(path);
  };

  const { unreadCount } = useNotification();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: '홈/대시보드' },
    { id: 'general-chat', icon: <MessageSquare size={20} />, label: 'AI 채팅' },
    { id: 'skills', icon: <Cpu size={20} />, label: '스킬' },
    { id: 'data', icon: <Database size={20} />, label: '데이터' },
    { id: 'admin', icon: <UserCog size={20} />, label: '관리자' },
  ];

  // Click outside handler for notification popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node) &&
          !(event.target as Element).closest('.animate-fade-in-up')) {
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0 z-50 relative">
        {/* Logo Section */}
        <button type="button" aria-label="KonaAgent 홈으로 이동" className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <div className="w-7 h-7 bg-[#FF3C42] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg text-[#000000]">KonaAgent</span>
        </button>

        {/* Center Navigation - Icons Only */}
        <div className="flex items-center gap-6">
            {navItems.map((item) => {
                let isActive = false;
                if (item.id === 'dashboard') {
                   isActive = currentView === 'dashboard' || currentView === 'chat';
                } else if (item.id === 'general-chat') {
                   isActive = currentView === 'general-chat';
                } else if (item.id === 'skills') {
                   isActive = currentView === 'skills';
                } else if (item.id === 'data') {
                   isActive = currentView === 'data';
                } else if (item.id === 'admin') {
                   isActive = currentView === 'admin';
                }

                return (
                    <Tooltip key={item.id}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(item.id)}
                                className={`rounded-lg ${
                                    isActive
                                    ? 'text-[#FF3C42] bg-red-50'
                                    : 'text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50'
                                }`}
                            >
                                {item.icon}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{item.label}</TooltipContent>
                    </Tooltip>
                );
            })}
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-4">
            <div className="relative">
                <Button
                    ref={bellRef}
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPopupOpen(!isPopupOpen)}
                    aria-label={unreadCount > 0 ? `알림 ${unreadCount}건 읽지 않음` : '알림'}
                    className={`rounded-full relative ${isPopupOpen ? 'bg-gray-100 text-[#FF3C42]' : 'text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50'}`}
                >
                    <Bell size={20} aria-hidden="true" />
                    {unreadCount > 0 && (
                        <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3C42] rounded-full border border-white"></span>
                    )}
                </Button>

                {/* Notification Popup */}
                <NotificationPopup
                    isOpen={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    onNavigate={(anomaly) => {
                        if (onAnomalyClick) onAnomalyClick(anomaly);
                    }}
                />
            </div>

            <ProfileDropdown
                userName="홍길동"
                userRole="Administrator"
                userInitial="홍"
                onLogout={onLogout}
                onProfileClick={() => navigate('admin')}
                onSettingsClick={() => navigate('skills')}
            />
        </div>
    </nav>
  );
};

export default Sidebar;
