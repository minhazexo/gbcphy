import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaTachometerAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardList,
  FaHistory,
  FaCog,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaBell,
  FaShieldAlt,
  FaSun,
  FaMoon,
  FaUser,
  FaLayerGroup,
  FaChartPie,
  FaFileAlt,
} from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext.js";
import { useRBAC } from "../../../context/RBACContext.js";
import { useTheme } from "../../../context/ThemeContext.js";
import Badge from "../ui/Badge.js";
import Avatar from "../ui/Avatar.js";
import Dropdown from "../ui/Dropdown.js";
import StatCard from "../ui/StatCard.js";
import Separator from "../ui/Separator.js";
import Skeleton from "../ui/Skeleton.js";
import "./AdminSidebar.scss";

const ROLE_RANK = {
  super_admin: 4,
  department_admin: 3,
  faculty: 2,
  student: 1,
};

const ROLE_BADGE_VARIANT = {
  super_admin: "error",
  department_admin: "warning",
  faculty: "info",
  student: "default",
};

const canAccessRole = (itemRoles, userRole) => {
  if (!userRole) {
    return false;
  }
  if (itemRoles.includes(userRole)) {
    return true;
  }
  const userRank = ROLE_RANK[userRole] ?? 0;
  return itemRoles.some((role) => userRank >= (ROLE_RANK[role] ?? 0));
};

const MENU_GROUPS = [
  {
    label: "Navigation",
    items: [
      {
        path: "/admin/dashboard",
        label: "Dashboard",
        roles: ["super_admin", "department_admin", "faculty", "student"],
        icon: FaTachometerAlt,
      },
      {
        path: "/admin/students",
        label: "Students",
        roles: ["super_admin", "department_admin"],
        icon: FaUsers,
        badge: 12,
      },
      {
        path: "/admin/faculty",
        label: "Faculty",
        roles: ["super_admin", "department_admin"],
        icon: FaChalkboardTeacher,
      },
      {
        path: "/admin/approvals",
        label: "Approvals",
        roles: ["super_admin", "department_admin"],
        icon: FaClipboardList,
        badge: 3,
      },
      {
        path: "/admin/content",
        label: "Content",
        roles: ["super_admin", "department_admin", "faculty"],
        icon: FaFileAlt,
      },
      {
        path: "/admin/activity-logs",
        label: "Activity Logs",
        roles: ["super_admin"],
        icon: FaHistory,
      },
    ],
  },
  {
    label: "Settings",
    roles: ["super_admin"],
    items: [
      {
        path: "/admin/settings",
        label: "Settings",
        roles: ["super_admin"],
        icon: FaCog,
      },
    ],
  },
  {
    label: "Actions",
    items: [
      {
        path: "/",
        label: "Visit Site",
        roles: ["super_admin", "department_admin", "faculty", "student"],
        icon: FaExternalLinkAlt,
      },
      {
        label: "Sign Out",
        roles: ["super_admin", "department_admin", "faculty", "student"],
        icon: FaSignOutAlt,
        action: "signout",
      },
    ],
  },
];

const QUICK_STATS = [
  {
    title: "Pending",
    value: "12",
    icon: FaClipboardList,
    color: "warning",
    trend: { value: "+4%", positive: false, label: "vs last week" },
  },
  {
    title: "Approved",
    value: "142",
    icon: FaShieldAlt,
    color: "success",
    trend: { value: "+12%", positive: true, label: "vs last week" },
  },
  {
    title: "Faculty",
    value: "8",
    icon: FaChalkboardTeacher,
    color: "info",
  },
  {
    title: "Notices",
    value: "5",
    icon: FaBell,
    color: "primary",
  },
];

const formatRole = (role) => {
  if (!role) {
    return "—";
  }
  return role
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

const LoadingSidebar = ({ className, collapsed }) => (
  <nav
    className={["admin-sidebar", collapsed && "collapsed", className].filter(Boolean).join(" ")}
    role="navigation"
    aria-label="Admin navigation"
  >
    <div className="admin-sidebar__brand">
      <div className="admin-sidebar__brand-icon" aria-hidden="true">
        <Skeleton className="skeleton--circle" width="2.5rem" height="2.5rem" />
      </div>
      <Skeleton className="admin-sidebar__brand-text" width="40%" height="1.25rem" />
    </div>
    <Skeleton className="admin-sidebar__search" width="100%" height="2.75rem" />
    <nav className="admin-sidebar__nav">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="admin-sidebar__nav-item skeleton--text" width="60%" height="2.75rem" />
      ))}
    </nav>
    <div className="admin-sidebar__quick-stats">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="stat-card" width="100%" height="7rem" />
      ))}
    </div>
  </nav>
);

export const AdminSidebar = ({ className, onToggle }) => {
  const { userProfile, logout, isAuthenticated, authReady } = useAuth();
  const { userRole, loading: rbacLoading } = useRBAC();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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
    } catch {
      // ignore
    }
    onToggle?.(collapsed);
  }, [collapsed, onToggle]);

  const handleToggle = useCallback(() => setCollapsed((prev) => !prev), []);

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  const isActive = useCallback(
    (path) => {
      if (!path) return false;
      if (path === "/") return location.pathname === "/";
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
    },
    [location.pathname]
  );

  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return MENU_GROUPS.map((group) => {
      const items = group.items.filter(
        (item) =>
          canAccessRole(item.roles, userRole) &&
          (!query || item.label.toLowerCase().includes(query))
      );
      if (items.length === 0) {
        return null;
      }
      return { ...group, items };
    }).filter(Boolean);
  }, [searchQuery, userRole]);

  const name = userProfile?.full_name ?? "Admin User";
  const email = userProfile?.email ?? "admin@gbcphy.edu";
  const roleLabel = formatRole(userRole);
  const roleVariant = ROLE_BADGE_VARIANT[userRole] ?? "default";

  const userMenuItems = [
    {
      label: "My Profile",
      icon: FaUser,
      onClick: () => {
        navigate("/profile");
        setUserMenuOpen(false);
      },
    },
    {
      label: "Settings",
      icon: FaCog,
      onClick: () => {
        navigate("/admin/settings");
        setUserMenuOpen(false);
      },
    },
    {
      label: "Sign Out",
      icon: FaSignOutAlt,
      onClick: async () => {
        setUserMenuOpen(false);
        await handleSignOut();
      },
    },
  ];

  if (!authReady || rbacLoading) {
    return <LoadingSidebar className={className} collapsed={collapsed} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <motion.nav
      className={["admin-sidebar", collapsed && "collapsed", className].filter(Boolean).join(" ")}
      role="navigation"
      aria-label="Admin navigation"
      initial={{ x: collapsed ? 0 : -40 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <button
        className="admin-sidebar__toggle"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-pressed={!collapsed}
        onClick={handleToggle}
      >
        {collapsed ? <FaChevronRight size={20} /> : <FaChevronLeft size={20} />}
      </button>

      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-icon" aria-hidden="true">
          <FaLayerGroup size={20} />
        </div>
        <span className="admin-sidebar__brand-text">Dept. of Physics</span>
      </div>

      <button
        className="admin-sidebar__bell"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded="false"
        onClick={() => setNotifications(0)}
      >
        <FaBell size={18} />
        {notifications > 0 && (
          <span className="admin-sidebar__badge" aria-label={`${notifications} notifications`}>
            {notifications}
          </span>
        )}
      </button>

      <div className="admin-sidebar__search">
        <FaSearch size={16} className="admin-sidebar__search-icon" aria-hidden="true" />
        <input
          className="admin-sidebar__search-input"
          type="search"
          placeholder="Search menu..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search navigation"
          spellCheck={false}
        />
      </div>

      <nav className="admin-sidebar__nav" aria-label="Main navigation">
        {filteredGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="admin-sidebar__section-group">
            <span className="admin-sidebar__section">{group.label}</span>
            {group.items.map((item, itemIndex) => {
              const active = isActive(item.path);
              const isSignOut = item.action === "signout";
              const icon = item.icon ? <item.icon size={18} /> : null;
              const badge =
                item.badge != null ? (
                  <span
                    className="admin-sidebar__badge"
                    aria-label={`${item.label}: ${item.badge} pending`}
                  >
                    {item.badge}
                  </span>
                ) : null;
              const content = (
                <>
                  <span className="admin-sidebar__nav-icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="admin-sidebar__nav-text">{item.label}</span>
                  {badge}
                </>
              );

              if (isSignOut) {
                return (
                  <button
                    key={itemIndex}
                    className="admin-sidebar__nav-item"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={itemIndex}
                  to={item.path}
                  className={[
                    "admin-sidebar__nav-item",
                    active && "admin-sidebar__nav-item--active",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setCollapsed(false)}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__quick-stats">
        {QUICK_STATS.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <Separator orientation="horizontal" className="admin-sidebar__divider" aria-hidden="true" />

      <div className="admin-sidebar__user">
        <button
          className="admin-sidebar__user-trigger"
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
          onClick={toggleUserMenu}
        >
          <Avatar
            src={userProfile?.avatar_url}
            name={name}
            size="sm"
            className="admin-sidebar__user-avatar"
            aria-label="User avatar"
          />
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user-name">{name}</span>
            <span className="admin-sidebar__user-email">{email}</span>
            <Badge variant={roleVariant} size="sm" className="admin-sidebar__user-role">
              {roleLabel}
            </Badge>
          </div>
        </button>
        {userMenuOpen && (
          <div className="admin-sidebar__user-menu" role="menu" aria-label="User menu">
            {userMenuItems.map((item, index) => (
              <button
                key={index}
                className="admin-sidebar__user-menu-item"
                role="menuitem"
                onClick={item.onClick}
              >
                <item.icon size={16} className="admin-sidebar__nav-icon" aria-hidden="true" />
                <span className="admin-sidebar__nav-text">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="admin-sidebar__footer">
        <button
          className="admin-sidebar__footer-btn"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>
        <span className="admin-sidebar__footer-version">v1.0.0</span>
      </div>
    </motion.nav>
  );
};

export default AdminSidebar;


