// Sparkline — compact area line chart for mini stats.

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  className?: string;
}

const Sparkline = ({
  data,
  color = "var(--admin-primary)",
  height = 36,
  width = 120,
  className = "",
}: SparklineProps) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const step = width / (data.length - 1 || 1);

  const points = data.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / (max - min || 1)) * (height - 8);
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className={["admin-sparkline", className].filter(Boolean).join(" ")}>
      <svg
        className="admin-sparkline__svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        role="img"
        aria-label="Trend sparkline"
      >
        <path
          d={areaPoints}
          fill={color}
          fillOpacity={0.12}
          className="admin-sparkline__area"
        />
        <path
          d={`M ${points}`}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="admin-sparkline__line"
        />
        {data.map((value, index) => (
          <circle
            key={index}
            cx={index * step}
            cy={height - ((value - min) / (max - min || 1)) * (height - 8)}
            r={2.5}
            fill={color}
            className="admin-sparkline__dot"
          />
        ))}
      </svg>
    </div>
  );
};

export default Sparkline;
