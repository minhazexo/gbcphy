// Layouts AdminLayout TopNavbar — premium top bar with search, notifications, theme and profile menu.

import { useState, useCallback } from "react";
import { useTheme } from "../../../context/ThemeContext.tsx";
import { FaSun, FaMoon, FaBell, FaUser, FaSignOutAlt } from "react-icons/fa";
import Button from "../../../components/admin/ui/Button";
import Avatar from "../../../components/admin/ui/Avatar";
import Badge from "../../../components/admin/ui/Badge";
import "./TopNavbar.scss";

interface TopNavbarProps {
  onMenuToggle: () => void;
  user: { full_name?: string; email?: string; role?: string; avatar_url?: string | null };
  onLogout: () => void;
}

const NOTIFICATIONS = [
  { id: "n1", title: "New student registration", time: "2 min ago", unread: true },
  { id: "n2", title: "Registration approved for Rahim Khan", time: "15 min ago", unread: false },
  { id: "n3", title: "Optics seminar notice published", time: "1 hr ago", unread: false },
];

export default function TopNavbar({
  onMenuToggle,
  user,
  onLogout,
}: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
    setUserMenuOpen(false);
  }, [toggleTheme]);

  const handleLogout = useCallback(() => {
    onLogout();
    setUserMenuOpen(false);
  }, [onLogout]);

  const handleNotifications = useCallback(() => {
    setNotificationsOpen((prev) => !prev);
    setUserMenuOpen(false);
  }, []);

  const name = user.full_name || "Admin User";
  const email = user.email ?? "";
  const role = user.role ?? "admin";
  const avatarUrl = user.avatar_url ?? null;

  return (
    <nav className="top-navbar" aria-label="Top navigation">
      <div className="top-navbar__inner">
        <div className="top-navbar__left">
          <button type="button" className="top-navbar__menu-toggle" onClick={onMenuToggle} aria-label="Open navigation">
            <span className="top-navbar__hamburger" aria-hidden="true">
              <span></span><span></span><span></span>
            </span>
          </button>
        </div>

        <div className="top-navbar__right">
          <button
            type="button"
            className={`top-navbar__action-button top-navbar__notifications ${notificationsOpen ? "active" : ""}`}
            onClick={handleNotifications}
            aria-label="Notifications"
            aria-haspopup="true"
            aria-expanded={notificationsOpen}
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span className="top-navbar__badge">{unreadCount}</span>
            )}
          </button>

          <button
            type="button"
            className="top-navbar__action-button top-navbar__theme-toggle"
            onClick={handleThemeToggle}
            aria-label="Toggle dark/light theme"
          >
            {theme === "dark" ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>

          <div className="top-navbar__user" onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="User menu" role="button" tabIndex={0}>
            <div className="top-navbar__user-info">
              <div className="top-navbar__user-name">{name}</div>
              <div className="top-navbar__user-role">{role}</div>
            </div>
            <Avatar src={avatarUrl ?? undefined} name={name} size="sm" className="top-navbar__user-avatar" />
          </div>
        </div>
      </div>

      {notificationsOpen && (
        <div className="top-navbar__notifications-panel" onClick={(e) => e.stopPropagation()}>
          <div className="top-navbar__notifications-header">
            <span className="top-navbar__notifications-title">Notifications</span>
            <button type="button" className="top-navbar__notifications-mark-all" onClick={handleNotifications}>
              Mark all as read
            </button>
          </div>
          <div className="top-navbar__notifications-list">
            {NOTIFICATIONS.map((n) => (
              <button
                key={n.id}
                type="button"
                className={["top-navbar__notification-item", n.unread && "top-navbar__notification-item--unread"].filter(Boolean).join(" ")}
                onClick={handleNotifications}
              >
                <div className="top-navbar__notification-body">
                  <span className="top-navbar__notification-title">{n.title}</span>
                  <span className="top-navbar__notification-time">{n.time}</span>
                </div>
                {n.unread && <span className="top-navbar__notification-dot" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="top-navbar__notifications-footer">
            <Button variant="outline" size="sm" fullWidth onClick={handleNotifications}>
              View all notifications
            </Button>
          </div>
        </div>
      )}

      {userMenuOpen && (
        <div className="top-navbar__user-menu" onClick={(e) => e.stopPropagation()}>
          <div className="top-navbar__user-menu-header">
            <Avatar src={avatarUrl ?? undefined} name={name} size="lg" className="top-navbar__menu-avatar" />
            <div className="top-navbar__menu-user-info">
              <div className="top-navbar__menu-user-name">{name}</div>
              <div className="top-navbar__menu-user-email">{email}</div>
              <Badge variant="secondary" size="sm" className="top-navbar__menu-user-role-badge">
                {role}
              </Badge>
            </div>
          </div>
          <div className="top-navbar__user-menu-list">
            <button type="button" className="top-navbar__user-menu-item" onClick={() => { setUserMenuOpen(false); }}>
              <FaUser size={16} className="top-navbar__user-menu-icon" aria-hidden="true" />
              Profile
            </button>
            <button type="button" className="top-navbar__user-menu-item" onClick={handleLogout}>
              <FaSignOutAlt size={16} className="top-navbar__user-menu-icon" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
