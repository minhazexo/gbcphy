// Common Separator

import React from "react";
import "./Separator.scss";

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = "horizontal", className = "", ...rest }, ref) => {
    const classes = [
      "common-separator",
      `common-separator--${orientation}`,
      className
    ].filter(Boolean).join(" ");

    return <hr ref={ref} className={classes} {...rest} />;
  }
);

Separator.displayName = "Separator";
export default Separator;
