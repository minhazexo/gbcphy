// Common Modal

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
  sm: "common-modal--sm",
  md: "common-modal--md",
  lg: "common-modal--lg"
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
    "common-modal-overlay",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={classes} onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        className={`common-modal ${SIZE_CLASSES[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button type="button" className="common-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        )}
        {title && <h2 className="common-modal-title">{title}</h2>}
        {description && <p className="common-modal-description">{description}</p>}
        <div className="common-modal-content">{children}</div>
        {footer && <div className="common-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
