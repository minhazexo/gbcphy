// Premium select component for the admin dashboard.
import { useId } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./Select.scss";

const normalizeOptions = (options) =>
  options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

export const Select = ({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  error,
  helper,
  size = "md",
  className,
  required = false,
  "aria-label": ariaLabel
}) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  const labelId = label ? `${selectId}-label` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const normalized = normalizeOptions(options);

  const classes = [
    "admin-select",
    size === "sm" && "admin-select--sm",
    error && "admin-select--error",
    className || ""
  ].filter(Boolean).join(" ");

  const handleChange = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={classes}>
      {label && (
        <label htmlFor={selectId} className="admin-select-label">
          {label}
          {required && <span className="admin-select-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="admin-select-wrapper">
        <select
          id={selectId}
          className="admin-select-field"
          value={value === undefined || value === null ? "" : value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          aria-labelledby={labelId || undefined}
          aria-describedby={errorId || undefined}
          aria-invalid={error ? true : undefined}
          aria-label={ariaLabel || undefined}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {normalized.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="admin-select-arrow" aria-hidden="true">
          <FaChevronDown />
        </div>
      </div>
      {error && <p id={errorId} className="admin-select-error" role="alert">{error}</p>}
      {!error && helper && <p className="admin-select-helper">{helper}</p>}
    </div>
  );
};

export default Select;
