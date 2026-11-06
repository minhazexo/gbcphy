// Common Avatar

import React from "react";
import "./Avatar.scss";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
}

const getInitials = (name?: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ name, src, size = "md", className = "", ...rest }, ref) => {
    const classes = [
      "common-avatar",
      `common-avatar--${size}`,
      className
    ].filter(Boolean).join(" ");

    return src ? (
      <img ref={ref} src={src} alt={name || ""} className={classes} {...rest} />
    ) : (
      <div ref={ref as unknown as React.Ref<HTMLDivElement>} className={classes} {...rest}>
        {getInitials(name)}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";
export default Avatar;
