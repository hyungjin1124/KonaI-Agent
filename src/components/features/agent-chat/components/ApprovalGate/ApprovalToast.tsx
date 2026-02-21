import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ApprovalTierProps } from './types';

const AUTO_DISMISS_MS = 5000;

export const ApprovalToast: React.FC<ApprovalTierProps> = ({
  title,
  description,
  onApprove,
  onReject,
  onClose,
  rejectLabel,
  children,
}) => {
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const step = 100 / (AUTO_DISMISS_MS / 50);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) return 0;
        return next;
      });
    }, 50);

    timerRef.current = setTimeout(() => {
      onApprove();
    }, AUTO_DISMISS_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onApprove]);

  const handleCancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onReject();
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onClose?.();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#FF3C42] transition-[width] duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start gap-3 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            {description && (
              <p className="mt-0.5 text-xs text-gray-500">{description}</p>
            )}
            {children}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              {rejectLabel}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600"
              aria-label="닫기"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
