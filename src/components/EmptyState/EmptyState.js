// Empty state component with icon, title, description, and optional action button.

import { FaInbox, FaSearch, FaFolderOpen, FaUsers, FaBook } from "react-icons/fa";
import "./EmptyState.scss";

const ICONS = {
  inbox: FaInbox,
  search: FaSearch,
  folder: FaFolderOpen,
  users: FaUsers,
  book: FaBook
};

export const EmptyState = ({
  icon = "inbox",
  title = "No data available",
  description = "There is nothing to show here.",
  actionLabel,
  onAction,
  className,
  testId
}) => {
  const Icon = ICONS[icon] || FaInbox;

  return (
    <div
      className={`empty-state ${className || ""}`}
      data-testid={testId}
      role="region"
      aria-label={title}
    >
      <div className="empty-state-icon">
        <Icon aria-hidden="true" />
      </div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;