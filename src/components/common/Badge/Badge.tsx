// Common Badge

import React from "react";
import "./Badge.scss";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md";
  children?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", size = "md", className = "", children, ...rest }, ref) => {
    const classes = [
      "common-badge",
      `common-badge--${variant}`,
      `common-badge--${size}`,
      className
    ].filter(Boolean).join(" ");

    return <span ref={ref} className={classes} {...rest}>{children}</span>;
  }
);

Badge.displayName = "Badge";
export default Badge;
