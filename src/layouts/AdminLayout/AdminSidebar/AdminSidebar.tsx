// Layouts AdminLayout AdminSidebar — premium collapsible navigation.

import { useCallback } from "react";
import { NavLink } from "react-router-dom";
import { useRBAC } from "../../../context/RBACContext.tsx";
import {
  FaChartPie,
  FaUsers,
  FaChalkboardTeacher,
  FaClipboardCheck,
  FaFile,
  FaHistory,
  FaCog,
  FaBell,
  FaUser,
} from "react-icons/fa";
import "./AdminSidebar.scss";

const SIDEBAR_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: FaChartPie },
  { path: "/admin/students", label: "Students", icon: FaUsers },
  { path: "/admin/faculty", label: "Faculty", icon: FaChalkboardTeacher },
  { path: "/admin/approvals", label: "Approvals", icon: FaClipboardCheck },
  { path: "/admin/content", label: "Content", icon: FaFile },
  { path: "/admin/activity-logs", label: "Activity Logs", icon: FaHistory },
  { path: "/admin/settings", label: "Settings", icon: FaCog },
];

export default function AdminSidebar({ onToggle, collapsed, open }: { onToggle: (collapsed: boolean) => void; collapsed: boolean; open: boolean }) {
  const { userRole } = useRBAC();

  const isAdminRoute = (path: string) => {
    if (path === "/admin/students" || path === "/admin/faculty" || path === "/admin/approvals" || path === "/admin/content") {
      return userRole === "department_admin" || userRole === "super_admin";
    }
    if (path === "/admin/activity-logs" || path === "/admin/settings") {
      return userRole === "super_admin";
    }
    return true;
  };

  const handleItemClick = useCallback(() => {
    onToggle(false);
  }, [onToggle]);

  return (
    <nav className={`admin-sidebar ${!open ? "admin-sidebar--closed" : ""} ${collapsed ? "collapsed" : ""}`} aria-label="Main navigation" role="navigation">
      <div className="admin-sidebar__nav-wrap">
        <ul className="admin-sidebar__nav">
          {SIDEBAR_ITEMS.filter((item) => isAdminRoute(item.path)).map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="admin-sidebar__nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `admin-sidebar__nav-link ${isActive ? "active" : ""}`}
                  onClick={handleItemClick}
                  end={item.path === "/admin/dashboard"}
                >
                  <span className="admin-sidebar__nav-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="admin-sidebar__nav-label">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__user-avatar">
            <FaUser size={16} />
          </div>
          {!collapsed && (
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">Admin</span>
              <span className="admin-sidebar__user-role">Administrator</span>
            </div>
          )}
        </div>
        <div className="admin-sidebar__footer-actions">
          <button type="button" className="admin-sidebar__footer-btn" aria-label="Notifications">
            <FaBell size={16} />
          </button>
          <button type="button" className="admin-sidebar__footer-btn" aria-label="Settings">
            <FaCog size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
