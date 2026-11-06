// Admin UI - Card

import React from "react";
import "./Card.scss";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  clickable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = "md", clickable = false, className = "", children, ...rest }, ref) => {
    const classes = [
      "admin-card",
      `admin-card--p-${padding}`,
      hover && "admin-card--hover",
      clickable && "admin-card--clickable",
      className
    ].filter(Boolean).join(" ");

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
