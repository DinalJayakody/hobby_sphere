import React, { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { ToastItem, ToastKind, ToastViewport } from '../components/ui/Toast';

interface ToastContextType {
  toast: (message: string, kind?: ToastKind, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let idCounter = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info', durationMs = 4000) => {
      const id = `toast-${Date.now()}-${idCounter++}`;
      setToasts((prev) => [...prev, { id, kind, message }]);
      if (durationMs > 0) {
        setTimeout(() => dismiss(id), durationMs);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
