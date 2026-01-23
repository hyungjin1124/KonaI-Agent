
import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 bg-[#FFFFFF] bg-opacity-90 backdrop-blur-md z-10">
      <div className="flex items-center gap-1 cursor-pointer group">
        <span className="text-sm font-medium text-[#848383] group-hover:text-[#000000]">gemini3 pro</span>
        <ChevronDown size={14} className="text-[#848383]" />
      </div>

      <div className="flex items-center gap-4">
        <button data-testid="notification-bell" className="p-2 text-[#848383] hover:text-[#FF3C42] hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-[#E5E7EB]">
          <div className="w-8 h-8 rounded-full bg-[#FF3C42] flex items-center justify-center text-[10px] font-bold text-white uppercase">
            홍길동
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
