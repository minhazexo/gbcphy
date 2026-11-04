import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBars,
  FaSearch,
  FaSun,
  FaMoon,
  FaBell,
  FaUser,
  FaChevronDown,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext.js";
import { useRBAC } from "../../../context/RBACContext.js";
import { useTheme } from "../../../context/ThemeContext.js";
import Avatar from "../ui/Avatar.js";
import Badge from "../ui/Badge.js";
import Button from "../ui/Button.js";
import Separator from "../ui/Separator.js";
import "./TopNavbar.scss";

const DEBOUNCE_MS = 300;

const menuVariants = {
  hidden: { opacity: 0, y: -8, pointerEvents: "none" },
  visible: { opacity: 1, y: 0, pointerEvents: "auto" },
  exit: { opacity: 0, y: -8, pointerEvents: "none" }
};

export default function TopNavbar({
  className,
  onMenuToggle,
  breadcrumbs = [],
  notifications: notificationsProp,
  user: userProp,
  onLogout,
  onThemeToggle,
  onSearch
}) {
  const { userProfile, logout: authLogout } = useAuth();
  const { userRole } = useRBAC();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  const user = userProp ?? userProfile;
  const name = user?.full_name ?? user?.email ?? "Admin User";
  const email = user?.email ?? "";
  const avatarUrl = user?.avatar_url ?? null;
  const role = user?.role ?? userRole ?? "admin";

  const notifications = useMemo(() => {
    if (notificationsProp == null) {
      return [];
    }
    if (Array.isArray(notificationsProp)) {
      return notificationsProp;
    }
    if (typeof notificationsProp === "number" && notificationsProp > 0) {
      return Array.from(
        { length: Math.min(notificationsProp, 50) },
        (_, index) => ({
          id: `top-navbar-notification-${index}`,
          title: "New notification",
          unread: true
        })
      );
    }
    return [];
  }, [notificationsProp]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const closeMenus = useCallback(() => {
    setNotificationsOpen(false);
    setUserMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchQuery);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleLogout = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenus();
    try {
      await (onLogout ?? authLogout)?.();
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const isActiveHref = (href) => Boolean(href) && location.pathname === href;

  return (
    <nav className={`top-navbar ${className ?? ""}`} aria-label="Top navigation">
      <a href="#main-content" className="top-navbar__skip-link">
        Skip to main content
      </a>
      <div className="top-navbar__content">
        <div className="top-navbar__left">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<FaBars aria-hidden="true" />}
            className="top-navbar__hamburger"
            aria-label="Toggle navigation"
            onClick={onMenuToggle}
          />
          <Link
            to="/"
            className="top-navbar__brand"
            aria-label="GBC Physics Admin home"
          >
            <span className="top-navbar__brand-mark">GBC</span>
            <span className="top-navbar__brand-name">Physics Admin</span>
          </Link>
          {breadcrumbs.length > 0 && (
            <nav className="top-navbar__breadcrumbs" aria-label="Breadcrumb">
              <ol className="top-navbar__breadcrumb-list" role="list">
                {breadcrumbs.map((item, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const isCurrent = item.current ?? isLast;
                  const active = isCurrent || isActiveHref(item.href);
                  return (
                    <li
                      key={item.href ?? item.label ?? index}
                      className="top-navbar__breadcrumb-item"
                    >
                      {isLast || active ? (
                        <span
                          className="top-navbar__breadcrumb-current"
                          aria-current={active ? "page" : undefined}
                        >
                          {item.label}
                        </span>
                      ) : (
                        <Link
                          to={item.href || "#"}
                          className="top-navbar__breadcrumb-link"
                        >
                          {item.label}
                        </Link>
                      )}
                      {!isLast && (
                        <span
                          className="top-navbar__breadcrumb-separator"
                          aria-hidden="true"
                        >
                          &rsaquo;
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </div>
        <div className="top-navbar__center" role="search" aria-label="Global search">
          <div className="top-navbar__search">
            <FaSearch className="top-navbar__search-icon" aria-hidden="true" />
            <input
              type="search"
              className="top-navbar__search-input"
              placeholder="Search…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSearch?.(searchQuery);
                }
              }}
              aria-label="Search across courses, faculty, and notices"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery && (
              <button
                type="button"
                className="top-navbar__search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </div>
        <div className="top-navbar__right">
          <div className="top-navbar__actions">
            <button
              type="button"
              className="top-navbar__action-button top-navbar__theme-toggle"
              aria-label={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              title={
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
              }
              onClick={(event) => {
                event.stopPropagation();
                onThemeToggle?.();
                toggleTheme();
              }}
            >
              {theme === "dark" ? (
                <FaSun className="top-navbar__theme-icon" aria-hidden="true" />
              ) : (
                <FaMoon className="top-navbar__theme-icon" aria-hidden="true" />
              )}
              <span className="top-navbar__theme-label">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            <div
              ref={notificationsRef}
              className="top-navbar__notification"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="top-navbar__action-button top-navbar__bell"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                aria-haspopup="menu"
                aria-controls="top-navbar-notifications-menu"
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setUserMenuOpen(false);
                }}
              >
                <FaBell className="top-navbar__bell-icon" aria-hidden="true" />
                {unreadCount > 0 && (
                  <Badge
                    variant="error"
                    size="sm"
                    className="top-navbar__badge"
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Badge>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    id="top-navbar-notifications-menu"
                    role="menu"
                    aria-orientation="vertical"
                    aria-label="Notifications"
                    className="top-navbar__menu top-navbar__menu--right"
                  >
                    <header className="top-navbar__menu-header">
                      <span className="top-navbar__menu-title">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="top-navbar__menu-action"
                          onClick={(event) => {
                            event.stopPropagation();
                            closeMenus();
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </header>
                    <ul className="top-navbar__menu-list" role="none">
                      {notifications.length === 0 ? (
                        <li>
                          <p className="top-navbar__menu-empty">
                            No notifications
                          </p>
                        </li>
                      ) : (
                        notifications.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              className={`top-navbar__menu-item ${
                                !item.read
                                  ? "top-navbar__menu-item--unread"
                                  : ""
                              }`}
                              role="menuitem"
                              onClick={() => closeMenus()}
                            >
                              {!item.read && (
                                <span
                                  className="top-navbar__unread-dot"
                                  aria-hidden="true"
                                />
                              )}
                              <span className="top-navbar__menu-item-title">
                                {item.title}
                              </span>
                              {item.time && (
                                <span className="top-navbar__menu-item-time">
                                  {item.time}
                                </span>
                              )}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                    <footer className="top-navbar__menu-footer">
                      <Link
                        to="/admin/notifications"
                        className="top-navbar__menu-item top-navbar__menu-link"
                        onClick={closeMenus}
                      >
                        View all notifications
                      </Link>
                    </footer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Separator
              orientation="vertical"
              className="top-navbar__separator"
              aria-orientation="vertical"
            />

            <div
              ref={userMenuRef}
              className="top-navbar__user"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="top-navbar__action-button top-navbar__user-trigger"
                aria-label="User profile menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                aria-controls="top-navbar-user-menu"
                onClick={() => {
                  setUserMenuOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
              >
                <Avatar
                  name={name}
                  src={avatarUrl}
                  size="sm"
                  className="top-navbar__avatar"
                  aria-label={name}
                />
                <span className="top-navbar__user-name">{name}</span>
                <FaChevronDown
                  className="top-navbar__chevron"
                  aria-hidden="true"
                />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={menuVariants}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }}
                    id="top-navbar-user-menu"
                    role="menu"
                    aria-orientation="vertical"
                    aria-label="User menu"
                    className="top-navbar__menu top-navbar__menu--right"
                  >
                    <div className="top-navbar__menu-header">
                      <Avatar
                        name={name}
                        src={avatarUrl}
                        size="md"
                        className="top-navbar__menu-avatar"
                        aria-label={name}
                      />
                      <div className="top-navbar__menu-user-info">
                        <span className="top-navbar__menu-user-name">{name}</span>
                        <span className="top-navbar__menu-user-email">
                          {email}
                        </span>
                        <span className="top-navbar__menu-user-role">
                          {role}
                        </span>
                      </div>
                    </div>
                    <Separator
                      orientation="horizontal"
                      className="top-navbar__menu-divider"
                      aria-orientation="horizontal"
                    />
                    <ul className="top-navbar__menu-list" role="none">
                      <li>
                        <Link
                          to="/profile"
                          className="top-navbar__menu-item"
                          role="menuitem"
                          onClick={closeMenus}
                        >
                          <FaUser
                            className="top-navbar__menu-icon"
                            aria-hidden="true"
                          />
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/settings"
                          className="top-navbar__menu-item"
                          role="menuitem"
                          onClick={closeMenus}
                        >
                          <FaCog
                            className="top-navbar__menu-icon"
                            aria-hidden="true"
                          />
                          Account Settings
                        </Link>
                      </li>
                      <li>
                        <Separator
                          orientation="horizontal"
                          className="top-navbar__menu-divider--tight"
                          aria-orientation="horizontal"
                        />
                      </li>
                      <li>
                        <button
                          type="button"
                          className="top-navbar__menu-item top-navbar__menu-item--danger"
                          role="menuitem"
                          onClick={handleLogout}
                        >
                          <FaSignOutAlt
                            className="top-navbar__menu-icon"
                            aria-hidden="true"
                          />
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
