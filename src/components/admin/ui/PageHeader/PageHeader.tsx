// Admin UI - PageHeader

import React from "react";
import "./PageHeader.scss";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = ({ title, description, actions }: PageHeaderProps) => {
  return (
    <div className="admin-page-header">
      <div className="admin-page-header__content">
        <h1 className="admin-page-header__title">{title}</h1>
        {description && <p className="admin-page-header__description">{description}</p>}
      </div>
      {actions && <div className="admin-page-header__actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
