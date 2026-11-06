// Admin UI - Skeleton

import React from "react";
import "./Skeleton.scss";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circle";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, variant = "text", className = "", ...rest }, ref) => {
    const classes = [
      "admin-skeleton",
      `admin-skeleton--${variant}`,
      className
    ].filter(Boolean).join(" ");

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height) style.height = typeof height === "number" ? `${height}px` : height;

    return (
      <div ref={ref} className={classes} style={style} {...rest} />
    );
  }
);

Skeleton.displayName = "Skeleton";
export default Skeleton;
