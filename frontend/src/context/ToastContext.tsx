import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type ToastAction = {
  label: string;
  onClick: () => void;
};

type Toast = {
  id: number;
  message: string;
  action?: ToastAction;
};

type ToastOptions = {
  /** FR-25.1: an optional action turns a toast into a non-blocking prompt. */
  action?: ToastAction;
  /** Milliseconds before auto-dismiss; defaults to 3000 (8000 with action). */
  duration?: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = ++nextToastId;
    setToasts((current) => [...current, { id, message, action: options?.action }]);
    setTimeout(() => dismiss(id), options?.duration ?? (options?.action ? 8000 : 3000));
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div className="toast" key={toast.id}>
            {toast.message}
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
}
