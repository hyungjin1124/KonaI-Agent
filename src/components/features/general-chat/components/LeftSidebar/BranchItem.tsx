import React from 'react';
import { GitBranch, Trash2 } from '../../../../icons';
import type { BranchInfo } from '../../types';

interface BranchItemProps {
  branch: BranchInfo;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (branchId: string) => void;
}

export const BranchItem: React.FC<BranchItemProps> = ({
  branch,
  isActive,
  onClick,
  onDelete,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group w-full text-left pl-6 pr-2 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
      title={branch.name}
    >
      <GitBranch size={12} className={isActive ? 'text-blue-500' : 'text-gray-400'} />
      <span className="truncate flex-1">{branch.name}</span>
      {branch.id !== 'primary' && onDelete && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(branch.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              onDelete(branch.id);
            }
          }}
          className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
          aria-label={`${branch.name} 삭제`}
        >
          <Trash2 size={10} />
        </span>
      )}
    </button>
  );
};

export default BranchItem;
