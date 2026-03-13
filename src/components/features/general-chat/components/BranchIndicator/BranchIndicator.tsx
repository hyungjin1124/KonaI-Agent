import React, { useState, useRef, useEffect } from 'react';
import { GitBranch, ChevronRight, Trash2 } from '../../../../icons';
import type { BranchInfo } from '../../types';

interface BranchIndicatorProps {
  messageId: string;
  branches: BranchInfo[];
  activeBranchId: string;
  onSwitchBranch: (branchId: string) => void;
  onCreateBranch: (messageId: string) => void;
  onDeleteBranch?: (branchId: string) => void;
}

export const BranchIndicator: React.FC<BranchIndicatorProps> = ({
  messageId,
  branches,
  activeBranchId,
  onSwitchBranch,
  onCreateBranch,
  onDeleteBranch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const branchCount = branches.length;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        aria-label={`${branchCount}개 분기, 전환하려면 클릭`}
      >
        <GitBranch size={12} />
        <span>{branchCount}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 py-1">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 border-b border-gray-100">
            분기 목록
          </div>
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`flex items-center justify-between px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer ${
                branch.id === activeBranchId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <button
                className="flex-1 flex items-center gap-2 text-left"
                onClick={() => {
                  onSwitchBranch(branch.id);
                  setIsOpen(false);
                }}
              >
                <ChevronRight
                  size={14}
                  className={branch.id === activeBranchId ? 'text-blue-500' : 'text-gray-300'}
                />
                <span className="truncate">{branch.name}</span>
                <span className="text-[10px] text-gray-400 ml-auto">
                  {branch.messageCount}개
                </span>
              </button>
              {branch.id !== 'primary' && onDeleteBranch && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBranch(branch.id);
                  }}
                  className="p-1 ml-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                  aria-label={`${branch.name} 삭제`}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                onCreateBranch(messageId);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <GitBranch size={14} />
              <span>새 분기 만들기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchIndicator;
