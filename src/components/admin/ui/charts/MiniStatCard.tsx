// MiniStatCard — stat card variant with a sparkline trend.

import React from "react";

interface MiniStatCardProps {
  title: string;
  value: React.ReactNode;
  label?: string;
  Icon?: React.ComponentType<any>;
  trend?: { value: string; positive: boolean; label: string };
  sparkline?: number[];
  color?: string;
  className?: string;
}

const MiniStatCard = ({
  title,
  value,
  label,
  Icon,
  trend,
  sparkline,
  color,
  className,
}: MiniStatCardProps) => {
  const classes = [
    "admin-mini-stat-card",
    className,
  ].filter(Boolean).join(" ");
  const accent = color || "var(--admin-primary)";

  return (
      <div className={classes}>
      <div className="admin-mini-stat-card__header">
        {Icon && (
          <div className="admin-mini-stat-card__icon">
            <Icon size={18} />
          </div>
        )}
        <span className="admin-mini-stat-card__title">{title}</span>
      </div>
      <div className="admin-mini-stat-card__value">{value}</div>
      {label && <span className="admin-mini-stat-card__label">{label}</span>}
      {trend && (
        <div className="admin-mini-stat-card__trend">
          <span
            className={[
              "admin-mini-stat-card__trend-value",
              trend.positive ? "admin-mini-stat-card__trend--up" : "admin-mini-stat-card__trend--down",
            ].join(" ")}
          >
            {trend.value}
          </span>
          <span className="admin-mini-stat-card__trend-label">{trend.label}</span>
        </div>
      )}
      {sparkline && (
        <div className="admin-mini-stat-card__sparkline-wrap">
          <svg
            className="admin-mini-stat-card__sparkline"
            width="120"
            height="24"
            viewBox="0 0 120 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d={`M 0 24 ${sparkline
                .map((v, i) => `${i * (120 / (sparkline.length - 1))},${24 - (v / 100) * 16}`)
                .join(" ")} 120 24`}
              fill={accent}
              fillOpacity={0.12}
            />
            <path
              d={`M ${sparkline
                .map((v, i) => `${i * (120 / (sparkline.length - 1))},${24 - (v / 100) * 16}`)
                .join(" ")}`}
              fill="none"
              stroke={accent}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default MiniStatCard;
