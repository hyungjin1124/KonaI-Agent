import React, { useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldCheck, ShieldX, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ApprovalTierProps } from './types';

export const ApprovalModal: React.FC<ApprovalTierProps> = ({
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
  const approveButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the approve button on mount for keyboard accessibility
  useEffect(() => {
    const timer = setTimeout(() => {
      approveButtonRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onApprove();
      }
    },
    [onApprove]
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onReject()}>
      <DialogContent
        role="alertdialog"
        aria-describedby="approval-modal-desc"
        className="max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-[#FF3C42]" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription id="approval-modal-desc">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Content */}
        {children && <div className="my-2">{children}</div>}

        {/* Session permission */}
        {sessionPermissionCheckbox && (
          <div className="mt-2">{sessionPermissionCheckbox}</div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {onModify && modifyLabel && (
            <button
              type="button"
              onClick={onModify}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
            >
              <Pencil className="h-4 w-4" />
              {modifyLabel}
            </button>
          )}

          <button
            type="button"
            onClick={onReject}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-1"
          >
            <ShieldX className="h-4 w-4" />
            {rejectLabel}
          </button>

          <button
            ref={approveButtonRef}
            type="button"
            onClick={onApprove}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF3C42] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#e6363b] focus:outline-none focus:ring-2 focus:ring-[#FF3C42]/50 focus:ring-offset-1"
          >
            <ShieldCheck className="h-4 w-4" />
            {approveLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
