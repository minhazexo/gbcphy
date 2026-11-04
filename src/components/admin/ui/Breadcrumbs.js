// Breadcrumbs UI component for the admin dashboard.

import "./Breadcrumbs.scss";
import { motion } from "framer-motion";

const DEFAULT_SEPARATOR = (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M3.5 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

export const Breadcrumbs = ({
  items,
  className,
  separator: separatorProp = DEFAULT_SEPARATOR,
  maxItems = 5,
  size = "sm",
  "aria-label": ariaLabel = "Breadcrumb"
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const validSizes = ["sm", "md"];
  const sizeClass = validSizes.includes(size) ? size : "sm";

  const isTruncated = items.length > maxItems;
  const firstItems = isTruncated ? items.slice(0, 2) : items;
  const lastItems = isTruncated ? items.slice(Math.max(items.length - 2, 2)) : [];

  const renderItems = isTruncated
    ? [...firstItems, "__ellipsis__", ...lastItems]
    : items;

  return (
    <nav
      className={`breadcrumbs breadcrumbs--${sizeClass} ${className ?? ""}`}
      role="navigation"
      aria-label={ariaLabel}
    >
      <motion.div className="breadcrumbs__list" variants={containerVariants} initial="hidden" animate="visible">
        {renderItems.map((item, index) => {
          if (item === "__ellipsis__") {
            return (
              <motion.span
                key={`ellipsis-${index}`}
                className="breadcrumbs__ellipsis"
                aria-hidden="true"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                ...
              </motion.span>
            );
          }

          const isLast = index === renderItems.length - 1;
          const isCurrent = item.current || (!item.href && isLast);
          const showSeparator = !isLast;

          return (
            <motion.span
              key={item.href ?? `${item.label}-${index}`}
              className="breadcrumbs__item"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              {isCurrent ? (
                <span className="breadcrumbs__current" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a className="breadcrumbs__link" href={item.href}>
                  {item.label}
                </a>
              ) : (
                <span className="breadcrumbs__link">{item.label}</span>
              )}
              {showSeparator && (
                <span className="breadcrumbs__separator" aria-hidden="true">
                  {typeof separatorProp === "string" ? separatorProp : separatorProp}
                </span>
              )}
            </motion.span>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default Breadcrumbs;
