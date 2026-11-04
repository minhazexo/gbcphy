// Toast notification container UI component for the admin dashboard.

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTimes, FaBell, FaInfoCircle } from "react-icons/fa";
import "./Toast.scss";

const DEFAULT_DURATION = 4000;

const VARIANT_ICONS = {
  default: <FaBell aria-hidden="true" />,
  success: <FaCheck aria-hidden="true" />,
  error: <FaTimes aria-hidden="true" />,
  warning: <FaBell aria-hidden="true" />,
  info: <FaInfoCircle aria-hidden="true" />
};

const VARIANT_TITLES = {
  default: "Notification",
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info"
};

const POSITION_STYLES = {
  "top-right": { top: "var(--admin-space-4)", right: "var(--admin-space-4)" },
  "top-left": { top: "var(--admin-space-4)", left: "var(--admin-space-4)" },
  "bottom-right": {
    bottom: "var(--admin-space-4)",
    right: "var(--admin-space-4)"
  },
  "bottom-left": {
    bottom: "var(--admin-space-4)",
    left: "var(--admin-space-4)"
  }
};

export const Toast = ({ toasts, onDismiss, position = "top-right" }) => {
  const dismiss = useCallback(
    (id) => {
      if (typeof onDismiss === "function") {
        onDismiss(id);
      }
    },
    [onDismiss]
  );

  useEffect(() => {
    const timers = new Map();
    toasts.forEach((toast) => {
      const duration = toast.duration ?? DEFAULT_DURATION;
      const timer = setTimeout(() => dismiss(toast.id), duration);
      timers.set(toast.id, timer);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notifications"
      style={POSITION_STYLES[position] ?? POSITION_STYLES["top-right"]}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const variant = toast.variant ?? "default";
          return (
            <motion.div
              key={toast.id}
              className={`toast toast--${variant}`}
              role="alert"
              aria-live="polite"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="toast__icon">{VARIANT_ICONS[variant]}</div>
              <div className="toast__content">
                <h3 className="toast__title">
                  {toast.title ?? VARIANT_TITLES[variant]}
                </h3>
                {toast.description && (
                  <p className="toast__description">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                className="toast__close"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
              >
                <FaTimes />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;

