// Admin UI - StatCard

import React from "react";
import "./StatCard.scss";

interface Trend {
  value: string;
  positive: boolean;
  label: string;
}

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  label?: string;
  Icon?: React.ComponentType<any>;
  trend?: Trend;
  className?: string;
  color?: string;
}

const StatCard = ({
  title,
  value,
  label,
  Icon,
  trend,
  className
}: StatCardProps) => {
  const classes = ["admin-stat-card", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <div className="admin-stat-card__header">
        {Icon && <Icon size={20} className="admin-stat-card__icon" />}
        <span className="admin-stat-card__title">{title}</span>
      </div>
      <div className="admin-stat-card__value">{value}</div>
      {label && <span className="admin-stat-card__label">{label}</span>}
      {trend && (
        <div className="admin-stat-card__trend">
          <span className={trend.positive ? "admin-stat-card__trend--positive" : "admin-stat-card__trend--negative"}>
            {trend.value}
          </span>
          <span className="admin-stat-card__trend-label">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
