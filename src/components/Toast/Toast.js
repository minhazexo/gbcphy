// Toast notification component with a ToastProvider / useToast hook.

import { createContext, useContext, useCallback, useState, useEffect, useRef } from "react";
import "./Toast.scss";

const TYPES = ["success", "error", "warning", "info"];

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

  const toast = useCallback(({ message, type = "info", duration = 5000 }) => {
    if (!message) return;
    if (!TYPES.includes(type)) type = "info";
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const timers = new Map();
    toasts.forEach((t) => {
      const timer = setTimeout(() => dismiss(t.id), t.duration);
      timers.set(t.id, timer);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  const value = { toast, dismiss, toasts };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const typeIcon = {
    success: <span aria-hidden="true">&#10004;</span>,
    error: <span aria-hidden="true">&#10008;</span>,
    warning: <span aria-hidden="true">&#9888;</span>,
    info: <span aria-hidden="true">&#8505;</span>
  };

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          role="alert"
          aria-live="polite"
        >
          <span className="toast-icon">{typeIcon[t.type]}</span>
          <span className="toast-message">{t.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastProvider;