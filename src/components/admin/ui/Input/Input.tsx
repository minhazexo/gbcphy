// Admin UI - Input

import React from "react";
import "./Input.scss";

type StringChangeHandler = (value: string) => void;

type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "onChange"
> & {
  label?: string;
  type?: string;
  leftIcon?: React.ReactNode;
  size?: "sm" | "md";
  helper?: string;
  error?: string;
  onChange?: StringChangeHandler;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", leftIcon, size = "md", helper, error, className = "", onChange, ...rest }, ref) => {
    const classes = [
      "admin-input",
      `admin-input--${size}`,
      error && "admin-input--error",
      className
    ].filter(Boolean).join(" ");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className="admin-input-wrapper">
        {label && <label className="admin-input-label">{label}</label>}
        <div className="admin-input-field">
          {leftIcon && <span className="admin-input-icon">{leftIcon}</span>}
          <input ref={ref} type={type} className={classes} onChange={handleChange} {...rest} />
        </div>
        {error && <span className="admin-input-error">{error}</span>}
        {!error && helper && <span className="admin-input-helper">{helper}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
