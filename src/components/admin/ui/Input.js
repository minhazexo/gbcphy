// Premium input component for the admin dashboard.
import { useId } from "react";
import "./Input.scss";

export const Input = ({
  id,
  label,
  value,
  defaultValue,
  onChange,
  placeholder,
  disabled = false,
  error,
  helper,
  size = "md",
  leftIcon,
  rightIcon,
  className,
  type = "text",
  autoFocus = false,
  required = false,
  "aria-label": ariaLabel
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const labelId = label ? `${inputId}-label` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const classes = [
    "admin-input",
    size === "sm" && "admin-input--sm",
    error && "admin-input--error",
    className || ""
  ].filter(Boolean).join(" ");

  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={inputId} className="admin-input-label">
          {label}
          {required && <span className="admin-input-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="admin-input-wrapper">
        {leftIcon && <div className="admin-input-icon" aria-hidden="true">{leftIcon}</div>}
        <input
          id={inputId}
          className="admin-input-field"
          type={type}
          value={value === undefined || value === null ? "" : value}
          defaultValue={defaultValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoFocus={autoFocus}
          aria-labelledby={labelId || undefined}
          aria-describedby={errorId || undefined}
          aria-invalid={error ? true : undefined}
          aria-label={ariaLabel || undefined}
        />
        {rightIcon && <div className="admin-input-icon" aria-hidden="true">{rightIcon}</div>}
      </div>
      {error && <p id={errorId} className="admin-input-error" role="alert">{error}</p>}
      {!error && helper && <p className="admin-input-helper">{helper}</p>}
    </div>
  );
};

export default Input;
