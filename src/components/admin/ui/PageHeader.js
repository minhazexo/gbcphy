// Page header UI component for the admin dashboard.
// Provides a consistent page title, description, and action area across admin pages.
import { motion } from "framer-motion";
import "./PageHeader.scss";

export const PageHeader = ({
  title,
  description,
  actions,
  className,
  "aria-label": ariaLabel = "Page header"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={["page-header", className || ""].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      <div className="page-header__content">
        <div className="page-header__title-wrapper">
          <h1 className="page-header__title">{title}</h1>
          {description && <p className="page-header__description">{description}</p>}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </motion.div>
  );
};

export default PageHeader;
