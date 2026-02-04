
import React, { useState, useRef, useEffect } from 'react';
import {
  Settings,
  LayoutDashboard,
  Database,
  UserCog,
  History,
  Bell,
  Cpu,
  MessageSquare
} from './icons';
import { ViewType } from '../types';
import { useNotification, Anomaly } from '../context/NotificationContext';
import NotificationPopup from './NotificationPopup';
import ProfileDropdown from './ProfileDropdown';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  onAnomalyClick?: (anomaly: Anomaly) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onAnomalyClick, onLogout }) => {
  const { unreadCount } = useNotification();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'general-chat', icon: <MessageSquare size={20} />, label: '채팅' },
    { id: 'data', icon: <Database size={20} />, label: 'Data Management' },
    { id: 'admin', icon: <UserCog size={20} />, label: 'Admin' },
    { id: 'history', icon: <History size={20} />, label: 'Chat History' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  // Click outside handler for popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.animate-fade-in-up')) { // Check if click is inside popup
        setIsPopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full h-16 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between px-6 shrink-0 z-50 relative">
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('chat')}>
            <div className="w-7 h-7 bg-[#FF3C42] rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg text-[#000000]">KonaAgent</span>
        </div>

        {/* Center Navigation - Icons Only */}
        <div className="flex items-center gap-6">
            {navItems.map((item) => {
                // Modified Active Logic
                let isActive = false;
                if (item.id === 'dashboard') {
                   isActive = currentView === 'dashboard' || currentView === 'chat';
                } else if (item.id === 'general-chat') {
                   isActive = currentView === 'general-chat';
                } else if (item.id === 'data') {
                   isActive = currentView === 'data';
                } else if (item.id === 'admin') {
                   isActive = currentView === 'admin';
                } else if (item.id === 'history') {
                   isActive = currentView === 'history';
                } else if (item.id === 'settings') {
                   isActive = currentView === 'skills';
                }

                // Special handling for Settings dropdown
                if (item.id === 'settings') {
                    return (
                        <div 
                            key={item.id}
                            className="relative"
                            onMouseEnter={() => setIsSettingsHovered(true)}
                            onMouseLeave={() => setIsSettingsHovered(false)}
                        >
                            <button 
                                className={`p-2 rounded-lg transition-all ${
                                    isActive || isSettingsHovered
                                    ? 'text-[#FF3C42] bg-red-50' 
                                    : 'text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50'
                                }`}
                                title={item.label}
                            >
                                {item.icon}
                            </button>
                            
                            {/* Hover Dropdown */}
                            {isSettingsHovered && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-40 pt-2 z-50">
                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 animate-fade-in-up">
                                        <button
                                            onClick={() => {
                                                onNavigate('skills');
                                                setIsSettingsHovered(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FF3C42] flex items-center gap-2"
                                        >
                                            <Cpu size={16} />
                                            Skill 관리
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                return (
                    <button 
                        key={item.id}
                        // Modified onClick to pass correct ID
                        onClick={() => onNavigate(item.id === 'data' ? 'data' : item.id === 'dashboard' ? 'dashboard' : item.id === 'admin' ? 'admin' : item.id === 'history' ? 'history' : item.id === 'general-chat' ? 'general-chat' : 'chat')}
                        className={`p-2 rounded-lg transition-all ${
                            isActive 
                            ? 'text-[#FF3C42] bg-red-50' 
                            : 'text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50'
                        }`}
                        title={item.label}
                    >
                        {item.icon}
                    </button>
                );
            })}
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-4">
            <div className="relative">
                <button 
                    ref={bellRef}
                    onClick={() => setIsPopupOpen(!isPopupOpen)}
                    className={`p-2 rounded-full transition-colors relative ${isPopupOpen ? 'bg-gray-100 text-[#FF3C42]' : 'text-[#848383] hover:text-[#FF3C42] hover:bg-gray-50'}`}
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3C42] rounded-full border border-white"></span>
                    )}
                </button>
                
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
                onProfileClick={() => onNavigate('admin')}
                onSettingsClick={() => onNavigate('skills')}
            />
        </div>
    </nav>
  );
};

export default Sidebar;
