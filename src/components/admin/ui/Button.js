// Premium button component for the admin dashboard.
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
  "aria-label": ariaLabel
}) => {
  const id = useId();
  const isLink = Boolean(href);
  const isDisabled = disabled || loading;
  const resolvedType = TYPES.includes(type) ? type : "button";
  const resolvedVariant = VARIANTS.includes(variant) ? variant : "primary";
  const resolvedSize = SIZES.includes(size) ? size : "md";

  const classes = [
    "admin-button",
    `admin-button--${resolvedVariant}`,
    `admin-button--${resolvedSize}`,
    fullWidth && "admin-button--full",
    isDisabled && "admin-button--disabled",
    loading && "admin-button--loading",
    className
  ].filter(Boolean).join(" ");

  const common = {
    id,
    className: classes,
    "aria-label": ariaLabel || undefined,
    "aria-disabled": isDisabled || undefined,
    "aria-busy": loading || undefined
  };

  const content = loading ? (
    <span className="admin-button-spinner" aria-hidden="true" />
  ) : (
    <>
      {icon && <span className="admin-button-icon" aria-hidden="true">{icon}</span>}
      <span className="admin-button-content">{children}</span>
      {iconRight && (
        <span className="admin-button-icon admin-button-icon--right" aria-hidden="true">
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
