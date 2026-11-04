// Simple separator component for layout division.

import "./Separator.scss";

export const Separator = ({ orientation = "vertical", className, "aria-orientation": ariaOrientation }) => {
  const classes = [
    "common-separator",
    orientation === "vertical" ? "common-separator--vertical" : "common-separator--horizontal",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      aria-orientation={ariaOrientation ?? orientation}
      role="separator"
    />
  );
};

export default Separator;
