import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, Settings, LogOut, ChevronDown } from './icons';
import { useClickOutside } from '../hooks';
import DropdownMenuItem from './DropdownMenuItem';

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
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Menu items for keyboard navigation
  const menuItemCount = 3; // Profile, Settings, Logout

  // Click outside handler
  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % menuItemCount);
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + menuItemCount) % menuItemCount);
          break;

        case 'Tab':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    },
    [isOpen]
  );

  // Attach keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management for menu items
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuRef.current) {
      const buttons = menuRef.current.querySelectorAll('[role="menuitem"]');
      (buttons[focusedIndex] as HTMLElement)?.focus();
    }
  }, [isOpen, focusedIndex]);

  // Reset focus index when closing
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setFocusedIndex(0);
    }
  };

  const handleProfileClick = () => {
    onProfileClick?.();
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick?.();
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Profile Button Trigger */}
      <button
        ref={buttonRef}
        data-testid="profile-button"
        onClick={toggleDropdown}
        className={`flex items-center gap-2 pl-4 border-l border-[#E5E7EB] cursor-pointer group transition-colors ${
          isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
        } rounded-r-lg py-1 pr-2`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="프로필 메뉴 열기"
      >
        {/* User Info - Hidden on mobile */}
        <div className="text-right hidden md:block">
          <div className="text-xs font-bold text-[#000000] group-hover:text-[#FF3C42] transition-colors">
            {userName}
          </div>
          <div className="text-[10px] text-[#848383]">{userRole}</div>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#FF3C42] flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm group-hover:shadow-md transition-shadow">
          {userInitial}
        </div>

        {/* Chevron Indicator */}
        <ChevronDown
          size={14}
          className={`text-[#848383] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          data-testid="profile-dropdown"
          className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-fade-in-up"
          role="menu"
          aria-orientation="vertical"
        >
          <DropdownMenuItem
            icon={<User size={16} />}
            label="내 프로필"
            onClick={handleProfileClick}
            variant="default"
          />
          <DropdownMenuItem
            icon={<Settings size={16} />}
            label="설정"
            onClick={handleSettingsClick}
            variant="default"
          />

          {/* Divider */}
          <div className="h-px bg-gray-100 my-1 mx-2" role="separator" />

          <DropdownMenuItem
            icon={<LogOut size={16} />}
            label="로그아웃"
            onClick={handleLogout}
            variant="danger"
          />
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
