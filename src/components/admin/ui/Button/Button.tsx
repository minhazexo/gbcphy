// Admin UI - Button

import React from "react";
import "./Button.scss";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  as?: "a" | "button";
  href?: string;
  target?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      icon,
      as: Comp = "button",
      href,
      target,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref
  ) => {
    const isLink = Comp === "a";
    const classes = [
      "admin-button",
      `admin-button--${variant}`,
      `admin-button--${size}`,
      fullWidth && "admin-button--full",
      loading && "admin-button--loading",
      className
    ].filter(Boolean).join(" ");

    const content = (
      <>
        {loading && <span className="admin-button-spinner" aria-hidden="true" />}
        {icon && <span className="admin-button-icon">{icon}</span>}
        {children && <span className="admin-button-label">{children}</span>}
      </>
    );

    if (isLink) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          href={href}
          target={target}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={disabled || loading}
        type={rest.type ?? "button"}
        {...rest}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
