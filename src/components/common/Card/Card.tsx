// Common Card

import React from "react";
import "./Card.scss";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = "md", className = "", children, ...rest }, ref) => {
    const classes = [
      "common-card",
      `common-card--p-${padding}`,
      hover && "common-card--hover",
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
