// Premium checkbox component for the admin dashboard.
import { useEffect, useRef, useId } from "react";
import { FaCheck } from "react-icons/fa";
import "./Checkbox.scss";

export const Checkbox = ({
  id,
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  className,
  "aria-label": ariaLabel
}) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={["admin-checkbox", className || ""].filter(Boolean).join(" ")}>
      <div className="admin-checkbox-row">
        <input
          ref={inputRef}
          id={checkboxId}
          type="checkbox"
          className="admin-checkbox-input"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-label={ariaLabel || undefined}
        />
        <span className="admin-checkbox-trigger">
          <span className="admin-checkbox-box">
            <span className="admin-checkbox-check">
              {indeterminate ? (
                <span className="admin-checkbox-dash" aria-hidden="true" />
              ) : (
                <FaCheck />
              )}
            </span>
          </span>
        </span>
        {label && <label htmlFor={checkboxId} className="admin-checkbox-label">{label}</label>}
      </div>
    </div>
  );
};

export default Checkbox;
