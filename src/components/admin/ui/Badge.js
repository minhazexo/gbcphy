// Badge UI component for the admin dashboard.

import "./Badge.scss";

const VALID_VARIANTS = [
  "default",
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
  "info"
];

const VALID_SIZES = ["sm", "md"];

export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className
}) => {
  const variantClass = VALID_VARIANTS.includes(variant) ? variant : "default";
  const sizeClass = VALID_SIZES.includes(size) ? size : "md";

  return (
    <span
      className={`badge badge--${sizeClass} badge--${variantClass} ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
};

export default Badge;
