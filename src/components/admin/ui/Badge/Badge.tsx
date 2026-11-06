// Admin UI - Badge

import React from "react";
import "./Badge.scss";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", className = "", children, ...rest }, ref) => {
    const classes = [
      "admin-badge",
      `admin-badge--${variant}`,
      `admin-badge--${size}`,
      className
    ].filter(Boolean).join(" ");

    return <span ref={ref} className={classes} {...rest}>{children}</span>;
  }
);

Badge.displayName = "Badge";
export default Badge;
