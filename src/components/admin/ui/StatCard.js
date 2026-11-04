import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./StatCard.scss";

const COLOR_MAP = {
  primary: "--admin-primary",
  success: "--admin-success",
  warning: "--admin-warning",
  error: "--admin-error",
  info: "--admin-info"
};

const COLOR_LIGHT_MAP = {
  primary: "--admin-primary-light",
  success: "--admin-success-light",
  warning: "--admin-warning-light",
  error: "--admin-error-light",
  info: "--admin-info-light"
};

export const StatCard = ({
  title,
  value,
  label,
  icon: Icon,
  trend,
  footer,
  className,
  color = "primary"
}) => {
  const accent = COLOR_MAP[color] ?? COLOR_MAP.primary;
  const accentLight = COLOR_LIGHT_MAP[color] ?? COLOR_LIGHT_MAP.primary;
  const hasTrend = trend && trend.value != null;

  return (
    <motion.div
      className={["stat-card", className || ""].filter(Boolean).join(" ")}
      style={{
        "--stat-accent": `var(${accent})`,
        "--stat-accent-light": `var(${accentLight})`,
        background: `linear-gradient(135deg, var(--admin-surface, #ffffff) 0%, var(--stat-accent-light, rgba(79, 70, 229, 0.06)) 100%)`
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 0 24px var(--stat-accent-light, rgba(79, 70, 229, 0.35))"
      }}
      whileTap={{ y: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="stat-card__header">
        <span className="stat-card__title">{title}</span>
        {Icon && (
          <div className="stat-card__icon-wrapper" aria-hidden="true">
            <div className="stat-card__icon-bg" />
            <div className="stat-card__icon" style={{ fontSize: "1.5rem" }}>
              <Icon />
            </div>
          </div>
        )}
      </div>
      <div className="stat-card__value">{value}</div>
      {label && <span className="stat-card__label">{label}</span>}
      {hasTrend && (
        <div className={["stat-card__trend", `stat-card__trend--${trend.positive !== false ? "up" : "down"}`].filter(Boolean).join(" ")} aria-label={trend.label}>
          <span className="stat-card__trend-icon">
            {trend.positive !== false ? <FaArrowUp /> : <FaArrowDown />}
          </span>
          <span className="stat-card__trend-value">{trend.value}</span>
          {trend.label && <span className="stat-card__trend-label">{trend.label}</span>}
        </div>
      )}
      {footer && <div className="stat-card__footer">{footer}</div>}
    </motion.div>
  );
};

export default StatCard;
