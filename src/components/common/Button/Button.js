// Reusable Button component for the public website and admin panels.
// Based on the existing admin Button, generalized for app-wide use.

import { useId } from "react";
import "./Button.scss";

const VARIANTS = ["primary", "secondary", "ghost", "danger", "outline", "success", "warning"];
const SIZES = ["sm", "md", "lg"];
const TYPES = ["button", "submit", "reset"];

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconRight,
  onClick,
  className,
  href,
  "aria-label": ariaLabel,
}) => {
  const id = useId();
  const isLink = Boolean(href);
  const isDisabled = disabled || loading;
  const resolvedType = TYPES.includes(type) ? type : "button";
  const resolvedVariant = VARIANTS.includes(variant) ? variant : "primary";
  const resolvedSize = SIZES.includes(size) ? size : "md";

  const classes = [
    "common-button",
    `common-button--${resolvedVariant}`,
    `common-button--${resolvedSize}`,
    fullWidth && "common-button--full",
    isDisabled && "common-button--disabled",
    loading && "common-button--loading",
    className,
  ].filter(Boolean).join(" ");

  const common = {
    id,
    className: classes,
    "aria-label": ariaLabel || undefined,
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined,
  };

  const content = loading ? (
    <span className="common-button-spinner" aria-hidden="true" />
  ) : (
    <>
      {icon && <span className="common-button-icon" aria-hidden="true">{icon}</span>}
      <span className="common-button-content">{children}</span>
      {iconRight && (
        <span className="common-button-icon common-button-icon--right" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </>
  );

  const handleClick = (event) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  if (isLink) {
    return (
      <a
        href={href}
        role="button"
        {...common}
        onClick={isDisabled ? undefined : handleClick}
        tabIndex={isDisabled ? undefined : 0}
      >
        {content}
      </a>
    );
  }

  return (
    <button type={resolvedType} {...common} disabled={isDisabled} onClick={handleClick}>
      {content}
    </button>
  );
};

export default Button;
