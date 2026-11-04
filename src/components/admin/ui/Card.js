import { motion } from "framer-motion";
import "./Card.scss";

const PADDING_CLASSES = {
  none: "admin-card--padding-none",
  sm: "admin-card--padding-sm",
  md: "admin-card--padding-md",
  lg: "admin-card--padding-lg"
};

export const Card = ({
  children,
  className,
  padding = "md",
  hover = false,
  bordered = true,
  clickable = false,
  onClick,
  ariaLabel
}) => {
  const handleKeyDown = (event) => {
    if (!clickable || !onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const classes = [
    "admin-card",
    bordered ? "admin-card--bordered" : "admin-card--unbordered",
    hover && "admin-card--hoverable",
    clickable && "admin-card--clickable",
    PADDING_CLASSES[padding] ?? PADDING_CLASSES.md,
    className || ""
  ].filter(Boolean).join(" ");

  return (
    <motion.div
      className={classes}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      aria-label={ariaLabel || undefined}
      whileHover={hover ? { y: -2 } : undefined}
      whileTap={clickable ? { y: 1 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  );
};

export default Card;
