// Common Loader

import "./Loader.scss";

export const Loader = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`common-loader ${className}`} role="status" aria-label="Loading">
      <div className="common-loader__spinner" />
    </div>
  );
};

export default Loader;
