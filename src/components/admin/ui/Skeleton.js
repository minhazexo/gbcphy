import { motion } from "framer-motion";
import "./Skeleton.scss";

export const Skeleton = ({
  className,
  width,
  height,
  borderRadius,
  variant = "rect",
  isLoading = true
}) => {
  if (!isLoading) return null;

  const isCircle = variant === "circle";
  const style = {
    width: width ?? (isCircle ? "2.5rem" : "100%"),
    height: height ?? (isCircle ? "2.5rem" : "1rem"),
    borderRadius: borderRadius ?? (isCircle ? "50%" : "0.375rem")
  };

  if (variant === "text") {
    return (
      <div className={`skeleton skeleton--text ${className || ""}`} role="status" aria-label="Loading content" aria-busy="true">
        <motion.div className="skeleton-line" style={{ width: "100%", height: "0.875rem" }} animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="skeleton-line" style={{ width: "60%", height: "0.875rem" }} animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} />
        <motion.div className="skeleton-line" style={{ width: "80%", height: "0.875rem" }} animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }} />
      </div>
    );
  }

  return (
    <motion.div
      className={`skeleton skeleton--${variant} ${className || ""}`}
      style={style}
      role="status"
      aria-label="Loading"
      aria-busy="true"
      animate={{ opacity: [0.35, 1, 0.35] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
};

export default Skeleton;
