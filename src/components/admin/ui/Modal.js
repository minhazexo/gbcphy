// Modal dialog UI component for the admin dashboard.

import { useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import "./Modal.scss";

export const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnEscape = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  footer,
  "aria-label": ariaLabel
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const lastFocusedRef = useRef(null);

  const SIZE_WIDTHS = {
    sm: "var(--admin-space-10)",
    md: "var(--admin-space-12)",
    lg: "var(--admin-space-16)",
    xl: "720px",
    full: "calc(100% - 2rem)"
  };
  const width = SIZE_WIDTHS[size] ?? SIZE_WIDTHS.md;

  const modalTitleId = "admin-modal-title";
  const modalDescId = "admin-modal-description";

  const close = useCallback(
    (event) => {
      if (event) {
        event.stopPropagation();
      }
      if (typeof onClose === "function") {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (closeOnEscape && event.key === "Escape") {
        close();
      }
    },
    [closeOnEscape, close]
  );

  useEffect(() => {
    if (isOpen) {
      lastFocusedRef.current = document.activeElement;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
    return undefined;
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const focusable = contentRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        focusable.focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && lastFocusedRef.current) {
      const element = lastFocusedRef.current;
      if (typeof element.focus === "function") {
        element.focus();
      }
      lastFocusedRef.current = null;
    }
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (event) => {
      if (closeOnOverlayClick && event.target === overlayRef.current) {
        close(event);
      }
    },
    [closeOnOverlayClick, close]
  );

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          ref={overlayRef}
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`modal ${className ?? ""}`}
            style={{ width }}
            ref={contentRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? modalTitleId : undefined}
            aria-describedby={description ? modalDescId : undefined}
            aria-label={ariaLabel}
          >
            <div className="modal__header">
              {title && <h2 id={modalTitleId} className="modal__title">{title}</h2>}
              {description && (
                <p id={modalDescId} className="modal__description">{description}</p>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className="modal__close"
                  onClick={close}
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="modal__body">{children}</div>
            {footer && <div className="modal__footer">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;

