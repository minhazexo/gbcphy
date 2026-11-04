// Card component — a flexible container with optional hover, padding, and clickable behavior.

import "./Card.scss";

export const Card = ({
  children,
  className,
  padding = "md",
  hover = false,
  bordered = false,
  clickable = false,
  onClick,
  "aria-label": ariaLabel,
}) => {
  const paddingClasses = {
    none: "common-card--padding-none",
    sm: "common-card--padding-sm",
    md: "common-card--padding-md",
    lg: "common-card--padding-lg",
  };

  const classes = [
    "common-card",
    paddingClasses[padding] || "common-card--padding-md",
    hover && "common-card--hover",
    bordered && "common-card--bordered",
    clickable && "common-card--clickable",
    className,
  ].filter(Boolean).join(" ");

  const handleClick = (event) => {
    if (clickable && onClick) {
      onClick(event);
    }
  };

  return (
    <div
      className={classes}
      onClick={handleClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
};

export default Card;
