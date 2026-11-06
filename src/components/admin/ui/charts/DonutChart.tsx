// DonutChart — premium SVG donut chart with legend.

import { useMemo } from "react";
import "./charts.scss";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  totalLabel: string;
  totalValue: string | number;
  size?: number;
  className?: string;
  showLegend?: boolean;
}

const DonutChart = ({
  segments,
  totalLabel,
  totalValue,
  size = 200,
  className = "",
  showLegend = true,
}: DonutChartProps) => {
  const total = useMemo(
    () => segments.reduce((sum, s) => sum + s.value, 0),
    [segments]
  );

  const cumulative = useMemo(() => {
    let acc = 0;
    return segments.map((s) => {
      const start = acc;
      acc += s.value;
      return { ...s, start, end: acc };
    });
  }, [segments]);

  const path = (start: number, end: number) => {
    const startAngle = (start / total) * 2 * Math.PI;
    const endAngle = (end / total) * 2 * Math.PI;
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const x1 = size / 2 + (size / 2 - 14) * Math.cos(startAngle);
    const y1 = size / 2 + (size / 2 - 14) * Math.sin(startAngle);
    const x2 = size / 2 + (size / 2 - 14) * Math.cos(endAngle);
    const y2 = size / 2 + (size / 2 - 14) * Math.sin(endAngle);
    return [
      "M", x1, y1,
      "A", size / 2 - 14, size / 2 - 14, 0, largeArc, 1, x2, y2,
    ].join(" ");
  };

  return (
    <div className={["admin-donut-chart", className].filter(Boolean).join(" ")}>
      <div className="admin-donut-chart__wrapper">
        <svg
          className="admin-donut-chart__svg"
          width={size}
          height={size}
          viewBox="0 0 200 200"
          role="img"
          aria-label={`${totalLabel}: ${totalValue}`}
        >
          <circle
            cx="100"
            cy="100"
            r="86"
            fill="none"
            stroke="var(--admin-border)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {cumulative.map((seg) => (
            <path
              key={seg.label}
              d={path(seg.start, seg.end)}
              fill="none"
              stroke={seg.color || `var(--admin-chart-1)`}
              strokeWidth="14"
              strokeLinecap="round"
              className="admin-donut-chart__segment"
            />
          ))}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="var(--admin-text-primary)"
            fontSize="18"
            fontWeight="800"
            fontFamily="var(--admin-font-sans)"
            className="admin-donut-chart__total"
          >
            {totalValue}
          </text>
          <text
            x="100"
            y="118"
            textAnchor="middle"
            fill="var(--admin-text-secondary)"
            fontSize="11"
            fontFamily="var(--admin-font-sans)"
            className="admin-donut-chart__total-label"
          >
            {totalLabel}
          </text>
        </svg>
      </div>

      {showLegend && (
        <div className="admin-donut-chart__legend">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className="admin-donut-chart__legend-item"
            >
              <span
                className="admin-donut-chart__legend-dot"
                style={{ backgroundColor: seg.color || "var(--admin-text-muted)" }}
                aria-hidden="true"
              />
              <span className="admin-donut-chart__legend-label">{seg.label}</span>
              <span className="admin-donut-chart__legend-value">
                {seg.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
