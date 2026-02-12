'use client';

import React from 'react';
import { User, Settings, LogOut, ChevronDown } from './icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileDropdownProps {
  userName: string;
  userRole: string;
  userInitial: string;
  onLogout: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  userName,
  userRole,
  userInitial,
  onLogout,
  onProfileClick,
  onSettingsClick,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          data-testid="profile-button"
          className={`flex items-center gap-2 pl-4 border-l border-[#E5E7EB] cursor-pointer group transition-colors ${
            isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
          } rounded-r-lg py-1 pr-2`}
          aria-label="프로필 메뉴 열기"
        >
          {/* User Info - Hidden on mobile */}
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-[#000000] group-hover:text-[#FF3C42] transition-colors">
              {userName}
            </div>
            <div className="text-[10px] text-[#848383]">{userRole}</div>
          </div>

          <Avatar className="w-8 h-8 shadow-sm group-hover:shadow-md transition-shadow">
            <AvatarFallback className="bg-[#FF3C42] text-[10px] font-bold text-white uppercase">
              {userInitial}
            </AvatarFallback>
          </Avatar>

          <ChevronDown
            size={14}
            className={`text-[#848383] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        data-testid="profile-dropdown"
        align="end"
        sideOffset={8}
        className="w-48 rounded-xl py-1"
      >
        <DropdownMenuItem
          onClick={() => onProfileClick?.()}
          className="px-4 py-2.5 gap-3 text-gray-700 focus:text-[#FF3C42] cursor-pointer"
        >
          <User size={16} className="shrink-0" />
          <span>내 프로필</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSettingsClick?.()}
          className="px-4 py-2.5 gap-3 text-gray-700 focus:text-[#FF3C42] cursor-pointer"
        >
          <Settings size={16} className="shrink-0" />
          <span>설정</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="mx-2 bg-gray-100" />

        <DropdownMenuItem
          onClick={onLogout}
          className="px-4 py-2.5 gap-3 text-red-600 focus:text-red-700 focus:bg-red-50 font-medium cursor-pointer"
        >
          <LogOut size={16} className="shrink-0" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
