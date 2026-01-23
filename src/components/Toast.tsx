import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../types';
import { STATUS_COLORS } from '../constants';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const TOAST_ICONS: Record<ToastType['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const TOAST_STYLES: Record<ToastType['type'], { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: STATUS_COLORS.SUCCESS.hex,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: STATUS_COLORS.CRITICAL.hex,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: STATUS_COLORS.WARNING.hex,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: STATUS_COLORS.INFO.hex,
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const { id, type, title, message, duration = 5000, dismissible = true } = toast;
  const styles = TOAST_STYLES[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${styles.bg} ${styles.border}
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <span
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white text-sm font-bold"
        style={{ backgroundColor: styles.icon }}
      >
        {TOAST_ICONS[type]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Toast;
