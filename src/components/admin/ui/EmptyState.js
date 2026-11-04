import { motion } from "framer-motion";
import "./EmptyState.scss";

export const EmptyState = ({ icon, title, description, action, className }) => {
  return (
    <motion.div
      className={["empty-state", className || ""].filter(Boolean).join(" ")}
      role="region"
      aria-label={title || undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {icon && <div className="empty-state__icon" aria-hidden="true">{icon}</div>}
      <h2 className="empty-state__title">{title}</h2>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
