// Premium textarea component for the admin dashboard.
import { useId } from "react";
import "./Textarea.scss";

export const Textarea = ({
  id,
  label,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  error,
  helper,
  className,
  rows = 4,
  required = false,
  "aria-label": ariaLabel
}) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const labelId = label ? `${textareaId}-label` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;

  const classes = [
    "admin-textarea",
    error && "admin-textarea--error",
    className || ""
  ].filter(Boolean).join(" ");

  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={textareaId} className="admin-textarea-label">
          {label}
          {required && <span className="admin-textarea-required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className="admin-textarea-field"
        value={value === undefined || value === null ? "" : value}
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        aria-labelledby={labelId || undefined}
        aria-describedby={errorId || undefined}
        aria-invalid={error ? true : undefined}
        aria-label={ariaLabel || undefined}
      />
      {error && <p id={errorId} className="admin-textarea-error" role="alert">{error}</p>}
      {!error && helper && <p className="admin-textarea-helper">{helper}</p>}
    </div>
  );
};

export default Textarea;
