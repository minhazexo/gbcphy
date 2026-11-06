// Admin UI - Select

import React from "react";
import "./Select.scss";

type StringChangeHandler = (value: string) => void;

interface SelectOption {
  label: string;
  value: string;
}

type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "size" | "onChange"
> & {
  label?: string;
  options?: SelectOption[];
  size?: "sm" | "md";
  placeholder?: string;
  onChange?: StringChangeHandler;
};

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options = [], size = "md", placeholder, onChange, className = "", ...rest }, ref) => {
    const classes = [
      "admin-select",
      `admin-select--${size}`,
      className
    ].filter(Boolean).join(" ");

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="admin-select-wrapper">
        {label && <label className="admin-select-label">{label}</label>}
        <div className="admin-select-field">
          <select ref={ref} className={classes} onChange={handleChange} {...rest}>
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
