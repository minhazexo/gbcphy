// Confirmation dialog component.

import { useState } from "react";
import "./ConfirmDialog.scss";

export const ConfirmDialog = ({
  title = "Confirm action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  open = true
}) => {
  const [isOpen, setIsOpen] = useState(open);

  const handleConfirm = () => {
    setIsOpen(false);
    if (onCancel) onCancel();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onCancel) onCancel();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="confirm-backdrop" onClick={handleCancel} />
      <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <div className="confirm-header">
          <h2 id="confirm-title" className="confirm-title">{title}</h2>
          <button type="button" className="confirm-close" onClick={handleCancel} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="confirm-body">
          <p id="confirm-message" className="confirm-message">{message}</p>
        </div>
        <div className="confirm-actions">
          <button type="button" className="confirm-btn confirm-btn--cancel" onClick={handleCancel}>
            {cancelText}
          </button>
          <button type="button" className="confirm-btn confirm-btn--confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;