// Loading skeleton components for text, avatar, card, and table row.

import "./LoadingSkeleton.scss";

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={`skeleton-text ${className || ""}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton-line" style={{ width: i === lines - 1 ? "60%" : "100%" }} />
    ))}
  </div>
);

export const SkeletonAvatar = ({ className }) => (
  <div className={`skeleton-avatar ${className || ""}`} />
);

export const SkeletonCard = ({ className }) => (
  <div className={`skeleton-card ${className || ""}`}>
    <div className="skeleton-avatar" />
    <div className="skeleton-text" />
  </div>
);

export const SkeletonTableRow = ({ className, cells = 4 }) => (
  <div className={`skeleton-table-row ${className || ""}`}>
    {Array.from({ length: cells }).map((_, i) => (
      <div key={i} className="skeleton-cell" style={{ width: i === 0 ? "20%" : "80%" }} />
    ))}
  </div>
);

export const LoadingSkeleton = ({ type = "text", ...props }) => {
  const components = {
    text: SkeletonText,
    avatar: SkeletonAvatar,
    card: SkeletonCard,
    "table-row": SkeletonTableRow
  };
  const Component = components[type] || SkeletonText;
  return <Component {...props} />;
};

export default LoadingSkeleton;