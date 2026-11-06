// Admin UI - Modal

import React, { useEffect } from "react";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const SIZE_CLASSES: Record<string, string> = {
  sm: "admin-modal--sm",
  md: "admin-modal--md",
  lg: "admin-modal--lg"
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  showCloseButton = true,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  children,
  footer,
  className = ""
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return undefined;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const classes = [
    "admin-modal-overlay",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        className={`admin-modal ${SIZE_CLASSES[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        )}
        {title && <h2 className="admin-modal-title">{title}</h2>}
        {description && <p className="admin-modal-description">{description}</p>}
        <div className="admin-modal-content">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
