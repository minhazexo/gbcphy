// Simple animated loader/spinner component.

import "./Loader.scss";

export const Loader = ({
  size = "md",
  className,
  "aria-label": ariaLabel = "Loading",
}) => {
  const sizeClasses = {
    sm: "common-loader--sm",
    md: "common-loader--md",
    lg: "common-loader--lg",
  };

  return (
    <div
      className={["common-loader", sizeClasses[size], className].filter(Boolean).join(" ")}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="common-loader__spinner" />
    </div>
  );
};

export default Loader;
