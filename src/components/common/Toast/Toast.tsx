// Common Toast - consolidated with admin/ui/Toast

import { createContext, useContext, useCallback, useState, useEffect } from "react";
import "./Toast.scss";

interface ToastItem {
  id: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  title?: string;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPES = ["success", "error", "warning", "info"];
const TOAST_LIMIT = 50;

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const newToast: ToastItem = { id, ...toast, duration: toast.duration ?? 5000 };
      setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT));
      return id;
    },
    []
  );

  const removeToast = useCallback(
    (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const toast = useCallback(
    ({ message, type = "info", duration = 5000, title }: Omit<ToastItem, "id">): string => {
      if (!message && !title) return "";
      if (!TYPES.includes(type)) type = "info";
      return addToast({ message, type, duration, title });
    },
    [addToast]
  );

  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    toasts.forEach((t) => {
      const timer = setTimeout(() => removeToast(t.id), t.duration);
      timers.set(t.id, timer);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  const value: ToastContextValue = { toast, dismiss: removeToast, toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  success: <span aria-hidden="true">&#10004;</span>,
  error: <span aria-hidden="true">&#10008;</span>,
  warning: <span aria-hidden="true">&#9888;</span>,
  info: <span aria-hidden="true">&#8505;</span>,
};

const TYPE_VARIANT: Record<string, string> = {
  success: "common-toast--success",
  error: "common-toast--error",
  warning: "common-toast--warning",
  info: "common-toast--info",
};

const ToastContainer = ({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="common-toast-container" role="region" aria-label="Notifications">
      {toasts.map((t) => {
        const Icon = TYPE_ICON[t.type ?? "info"] || TYPE_ICON.info;
        const variantClass = TYPE_VARIANT[t.type ?? "info"] || TYPE_VARIANT.info;
        return (
          <div
            key={t.id}
            className={`common-toast ${variantClass}`}
            role="alert"
            aria-live="polite"
          >
            <span className="common-toast-icon">{Icon}</span>
            <div className="common-toast-content">
              {t.title && <strong className="common-toast-title">{t.title}</strong>}
              {t.message && <span className="common-toast-message">{t.message}</span>}
            </div>
            <button
              type="button"
              className="common-toast-close"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastProvider;
