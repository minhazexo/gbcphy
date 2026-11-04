// Premium radio component for the admin dashboard.
import { useId } from "react";
import "./Radio.scss";

export const Radio = ({
  id,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  label,
  error,
  helper,
  className
}) => {
  const generatedId = useId();
  const radioId = id || generatedId;

  const classes = [
    "admin-radio",
    error && "admin-radio--error",
    className || ""
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="admin-radio-row">
        <span className="admin-radio-trigger">
          <input
            id={radioId}
            name={name}
            type="radio"
            value={value}
            className="admin-radio-input"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <span className="admin-radio-box">
            <span className="admin-radio-dot" />
          </span>
        </span>
        {label && <label htmlFor={radioId} className="admin-radio-label">{label}</label>}
      </div>
      {error && <p className="admin-radio-error" role="alert">{error}</p>}
      {!error && helper && <p className="admin-radio-helper">{helper}</p>}
    </div>
  );
};

export default Radio;
