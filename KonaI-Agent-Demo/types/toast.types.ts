// Toast notification types

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 for persistent
  dismissible?: boolean;
}

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}
