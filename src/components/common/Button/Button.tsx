// Common Button

import React from "react";
import "./Button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth = false, loading = false, icon, className = "", disabled, children, ...rest }, ref) => {
    const classes = [
      "common-button",
      `common-button--${variant}`,
      `common-button--${size}`,
      fullWidth && "common-button--full",
      loading && "common-button--loading",
      className
    ].filter(Boolean).join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        type={rest.type ?? "button"}
        {...rest}
      >
        {loading && <span className="common-button-spinner" aria-hidden="true" />}
        {icon && <span className="common-button-icon">{icon}</span>}
        {children && <span className="common-button-label">{children}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
