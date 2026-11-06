// BarChart — premium horizontal bar chart.

interface BarChartItem {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  maxValue?: number;
  height?: number;
  className?: string;
  showValues?: boolean;
}

const BarChart = ({
  data,
  maxValue,
  className = "",
  showValues = true,
}: BarChartProps) => {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={["admin-bar-chart", className].filter(Boolean).join(" ")}>
      <div className="admin-bar-chart__grid">
        {data.map((item, index) => {
          const pct = Math.max((item.value / max) * 100, 3);
          const color = item.color || `var(--admin-chart-${((index % 6) + 1)})`;
          return (
            <div key={item.label} className="admin-bar-chart__row">
              <span className="admin-bar-chart__label">{item.label}</span>
              <div className="admin-bar-chart__track">
                <div
                  className="admin-bar-chart__bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
              {showValues && (
                <span className="admin-bar-chart__value">{item.value}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
