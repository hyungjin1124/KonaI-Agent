import React from 'react';
import { Check, X } from 'lucide-react';
import type { ApprovalItem } from './types';

interface ApprovalItemRowProps {
  item: ApprovalItem;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const STATUS_STYLES = {
  pending: 'border-gray-200 bg-white',
  approved: 'border-emerald-200 bg-emerald-50',
  rejected: 'border-red-200 bg-red-50',
} as const;

export const ApprovalItemRow: React.FC<ApprovalItemRowProps> = ({
  item,
  onApprove,
  onReject,
}) => {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors ${STATUS_STYLES[item.status]}`}
      role="listitem"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{item.description}</p>
        )}
      </div>

      {item.status === 'pending' ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600"
            aria-label={`${item.title} 승인`}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onReject(item.id)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
            aria-label={`${item.title} 거절`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === 'approved'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {item.status === 'approved' ? '승인' : '거절'}
        </span>
      )}
    </div>
  );
};
