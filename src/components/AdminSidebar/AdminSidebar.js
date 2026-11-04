import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import {
  FaTachometerAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaNewspaper,
  FaHistory,
  FaCog,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaBell,
  FaShieldAlt,
  FaUser,
  FaLock,
  FaChevronDown
} from "react-icons/fa";
import "./AdminSidebar.scss";

const MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FaTachometerAlt, roles: ["admin", "super_admin"] },
  { path: "/admin/students", label: "Students", icon: FaUsers, roles: ["admin", "super_admin"] },
  { path: "/admin/faculty", label: "Faculty", icon: FaChalkboardTeacher, roles: ["admin", "super_admin"] },
  { path: "/admin/approvals", label: "Approvals", icon: FaClipboardList, roles: ["admin", "super_admin"] },
  { path: "/admin/content", label: "Content", icon: FaNewspaper, roles: ["admin", "super_admin"] },
  { path: "/admin/activity-logs", label: "Activity Logs", icon: FaHistory, roles: ["admin", "super_admin"] },
  { path: "/admin/settings", label: "Settings", icon: FaCog, roles: ["super_admin"] },
  { path: "/", label: "Visit Site", icon: FaExternalLinkAlt, roles: ["admin", "super_admin"] }
];

export default function AdminSidebar() {
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("adminSidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("adminSidebarCollapsed", String(collapsed));
    } catch {}
  }, [collapsed]);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = async (event) => {
    event.preventDefault();
    await logout();
    setUserMenuOpen(false);
  };

  const name = userProfile?.full_name || userProfile?.email || "Admin User";
  const email = userProfile?.email || "";
  const role = userProfile?.role || "admin";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const filteredMenuItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return MENU_ITEMS.filter((item) => {
      const hasRole = item.roles.includes(role);
      if (!hasRole) return false;
      if (!query) return true;
      return item.label.toLowerCase().includes(query);
    });
  }, [searchQuery, role]);

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="toggle-icon">
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </span>
        {!collapsed && <span className="toggle-label">Collapse</span>}
      </button>

      <header className="sidebar-brand" title="GBC — Department of Physics">
        <div className="brand-mark">GBC</div>
        <div className="brand-text">
          <span className="brand-main">Department</span>
          <span className="brand-sub">of Physics</span>
        </div>
        <button
          type="button"
          className="brand-search-toggle"
          onClick={() => setUserMenuOpen(false)}
          aria-label="Search"
          title="Search"
        >
          <FaSearch className="brand-search-icon" />
        </button>
      </header>

      {/* Search bar (expanded mode only) */}
      {!collapsed && (
        <div className="sidebar-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search menu…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search menu items"
          />
        </div>
      )}

      <div className="sidebar-scroll">
        <nav className="sidebar-nav">
          {filteredMenuItems.length === 0 && !collapsed && (
            <div className="nav-empty">
              <span className="nav-empty-text">No matching items</span>
            </div>
          )}
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
                onClick={() => {
                  setCollapsed(false);
                  setUserMenuOpen(false);
                }}
              >
                <div className="nav-icon"><Icon /></div>
                {!collapsed && (
                  <>
                    <span className="nav-text">{item.label}</span>
                    {item.path === "/admin/approvals" && notifications > 0 && (
                      <span className="nav-badge">{notifications}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick stats widget */}
        {!collapsed && (
          <div className="sidebar-quick-stats">
            <div className="quick-stat">
              <span className="quick-stat-value">{25}</span>
              <span className="quick-stat-label">Pending</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-value">{42}</span>
              <span className="quick-stat-label">Approved</span>
            </div>
            <div className="quick-stat-divider" />
            <div className="quick-stat">
              <span className="quick-stat-value">{12}</span>
              <span className="quick-stat-label">Faculty</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-value">{8}</span>
              <span className="quick-stat-label">Notices</span>
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      <footer className="sidebar-footer">
        <button
          type="button"
          className="nav-link logout-link"
          title={collapsed ? "Sign Out" : undefined}
          onClick={handleLogout}
        >
          <div className="nav-icon"><FaSignOutAlt /></div>
          {!collapsed && <span className="nav-text">Sign Out</span>}
        </button>
      </footer>

      <div className="sidebar-user" title={`${name} • ${role}`} onClick={() => setUserMenuOpen(!userMenuOpen)}>
        <div className="user-avatar">{initials || "AD"}</div>
        <div className="user-info">
          <div className="user-name">{name}</div>
          <div className="user-email">{email}</div>
          <span className={`role-badge role-${role}`}>{role}</span>
        </div>
        <FaChevronDown className="user-menu-arrow" />
      </div>

      {/* User dropdown menu */}
      {userMenuOpen && !collapsed && (
        <div className="sidebar-user-menu">
          <div className="user-menu-header">
            <div className="user-menu-avatar">{initials || "AD"}</div>
            <div className="user-menu-info">
              <div className="user-menu-name">{name}</div>
              <div className="user-menu-email">{email}</div>
              <span className={`role-badge role-${role}`}>{role}</span>
            </div>
          </div>
          <div className="user-menu-divider" />
          <nav className="user-menu-nav">
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                setUserMenuOpen(false);
                location.pathname !== "/profile" && (window.location.href = "/profile");
              }}
            >
              <FaUser /> My Profile
            </button>
            <button
              type="button"
              className="user-menu-item danger"
              onClick={handleLogout}
            >
              <FaLock /> Lock Account
            </button>
            <button
              type="button"
              className="user-menu-item danger"
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </nav>
        </div>
      )}
    </aside>
  );
}
