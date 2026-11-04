// Toast notification system with ToastProvider / useToast hook.
// Consolidates the previous components/Toast and admin/ui/Toast implementations.

import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import "./Toast.scss";

const TYPES = ["success", "error", "warning", "info"];
const TOAST_LIMIT = 50;

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    (toast) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const newToast = { id, ...toast, duration: toast.duration ?? 5000 };
      setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT));
      return id;
    },
    [],
  );

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    [],
  );

  const toast = useCallback(
    ({ message, type = "info", duration = 5000, title }) => {
      if (!message && !title) return;
      if (!TYPES.includes(type)) type = "info";
      return addToast({ message, type, duration, title });
    },
    [addToast],
  );

  useEffect(() => {
    const timers = new Map();
    toasts.forEach((t) => {
      const timer = setTimeout(() => removeToast(t.id), t.duration);
      timers.set(t.id, timer);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, removeToast]);

  const value = { toast, dismiss: removeToast, toasts, addToast, removeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

const TYPE_ICON = {
  success: <span aria-hidden="true">&#10004;</span>,
  error: <span aria-hidden="true">&#10008;</span>,
  warning: <span aria-hidden="true">&#9888;</span>,
  info: <span aria-hidden="true">&#8505;</span>,
};

const TYPE_VARIANT = {
  success: "toast--success",
  error: "toast--error",
  warning: "toast--warning",
  info: "toast--info",
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="common-toast-container" role="region" aria-label="Notifications">
      {toasts.map((t) => {
        const Icon = TYPE_ICON[t.type] || TYPE_ICON.info;
        const variantClass = TYPE_VARIANT[t.type] || TYPE_VARIANT.info;
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
