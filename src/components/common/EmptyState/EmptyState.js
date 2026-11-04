// Empty state component with icon, title, description, and optional action button.

import { FaInbox, FaSearch, FaFolderOpen, FaUsers, FaBook } from "react-icons/fa";
import "./EmptyState.scss";

const ICONS = {
  inbox: FaInbox,
  search: FaSearch,
  folder: FaFolderOpen,
  users: FaUsers,
  book: FaBook,
};

export const EmptyState = ({
  icon = "inbox",
  title = "No data available",
  description = "There is nothing to show here.",
  actionLabel,
  onAction,
  className,
  testId,
}) => {
  const Icon = ICONS[icon] || FaInbox;

  return (
    <div
      className={`common-empty-state ${className || ""}`}
      data-testid={testId}
      role="region"
      aria-label={title}
    >
      <div className="common-empty-state__icon">
        <Icon aria-hidden="true" />
      </div>
      <h2 className="common-empty-state__title">{title}</h2>
      <p className="common-empty-state__description">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="common-empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
