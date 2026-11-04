import "./Separator.scss";

export const Separator = ({ orientation = "horizontal", className, ariaOrientation }) => {
  const classes = [
    "admin-separator",
    `admin-separator--${orientation}`,
    className || ""
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      role="separator"
      aria-orientation={ariaOrientation || orientation}
    />
  );
};

export default Separator;
