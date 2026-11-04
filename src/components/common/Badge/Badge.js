// Badge component for status labels and tags.

import "./Badge.scss";

const VARIANTS = ["primary", "secondary", "success", "warning", "error", "info", "default"];
const SIZES = ["sm", "md"];

export const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className,
}) => {
  const resolvedVariant = VARIANTS.includes(variant) ? variant : "default";
  const resolvedSize = SIZES.includes(size) ? size : "sm";

  const classes = [
    "common-badge",
    `common-badge--${resolvedVariant}`,
    `common-badge--${resolvedSize}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
