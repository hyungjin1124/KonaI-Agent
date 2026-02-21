import React, { useCallback } from 'react';
import { ShieldCheck, ShieldX, Pencil } from 'lucide-react';
import type { ApprovalTierProps } from './types';

export const ApprovalInlineCard: React.FC<ApprovalTierProps> = ({
  title,
  description,
  onApprove,
  onReject,
  onModify,
  approveLabel,
  rejectLabel,
  modifyLabel,
  children,
  sessionPermissionCheckbox,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onApprove();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onReject();
      }
    },
    [onApprove, onReject]
  );

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="rounded-xl border border-gray-200 border-l-[#FF3C42] border-l-4 bg-white p-4 shadow-sm"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        )}
      </div>

      {/* Content (items list, schema form, etc.) */}
      {children && <div className="mb-3">{children}</div>}

      {/* Session permission */}
      {sessionPermissionCheckbox && (
        <div className="mb-3">{sessionPermissionCheckbox}</div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF3C42] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#e6363b] focus:outline-none focus:ring-2 focus:ring-[#FF3C42]/50 focus:ring-offset-1"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {approveLabel}
        </button>

        <button
          type="button"
          onClick={onReject}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
        >
          <ShieldX className="h-3.5 w-3.5" />
          {rejectLabel}
        </button>

        {onModify && modifyLabel && (
          <button
            type="button"
            onClick={onModify}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            {modifyLabel}
          </button>
        )}

        {/* Keyboard hints */}
        <div className="ml-auto hidden items-center gap-2 text-[10px] text-gray-400 sm:flex">
          <span>
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">Enter</kbd> 승인
          </span>
          <span>
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">Esc</kbd> 거절
          </span>
        </div>
      </div>
    </div>
  );
};
