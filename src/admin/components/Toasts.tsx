import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'danger' | 'info';
type Toast = { id: number; type: ToastType; message: string };

const ICONS: Record<ToastType, string> = {
  success: 'bi-check-circle-fill',
  danger: 'bi-exclamation-octagon-fill',
  info: 'bi-info-circle-fill',
};

const ToastContext = createContext<((type: ToastType, message: string) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId.current;
      setToasts((all) => [...all, { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast show align-items-center text-bg-${toast.type} border-0`} role="status">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className={`bi ${ICONS[toast.type]}`} aria-hidden />
                {toast.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                aria-label="Close"
                onClick={() => dismiss(toast.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
