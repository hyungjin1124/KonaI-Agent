import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastOptions, ToastContextType } from '../types';
import { ToastContainer } from '../components/ToastContainer';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastIdCounter = 0;

const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast_${Date.now()}_${toastIdCounter}`;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((options: ToastOptions): string => {
    const id = generateToastId();
    const newToast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      dismissible: options.dismissible ?? true,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
