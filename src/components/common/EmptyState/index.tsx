// Common EmptyState

import React from "react";
import "./EmptyState.scss";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => {
  const classes = ["admin-empty-state", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {icon && <div className="admin-empty-state__icon">{icon}</div>}
      <h3 className="admin-empty-state__title">{title}</h3>
      {description && <p className="admin-empty-state__description">{description}</p>}
      {action && <div className="admin-empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
