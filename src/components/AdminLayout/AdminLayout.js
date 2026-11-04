import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar.js";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaChevronDown
} from "react-icons/fa";
import "./AdminLayout.scss";

const ROUTE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/students": "Student Management",
  "/admin/faculty": "Faculty Management",
  "/admin/approvals": "Registration Approvals",
  "/admin/content": "Content Management",
  "/admin/activity-logs": "Activity Logs",
  "/admin/settings": "Settings"
};

const titleForPath = (pathname) => {
  if (ROUTE_TITLES[pathname]) {
    return ROUTE_TITLES[pathname];
  }
  for (const [route, title] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(`${route}/`)) {
      return title;
    }
  }
  return "Admin";
};

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { userProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pageMounted, setPageMounted] = useState(false);

  const pageTitle = titleForPath(location.pathname);
  const name = userProfile?.full_name || userProfile?.email || "Admin User";
  const email = userProfile?.email || "";

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setSidebarOpen(false);
  const handleToggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleLogout = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await logout();
    setDropdownOpen(false);
    setSidebarOpen(false);
  };

  useEffect(() => {
    setPageMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".admin-layout__avatar-dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth > 768) {
      // Close sidebar on desktop when clicking main content
    }
  }, [sidebarOpen]);

  return (
    <div className={`admin-layout ${pageMounted ? "mounted" : ""}`}>
      <AdminSidebar />

      <button
        type="button"
        className="admin-layout__hamburger"
        onClick={handleToggleSidebar}
        aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={sidebarOpen}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {sidebarOpen && (
        <div
          className="admin-layout__scrim"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <main className={`admin-layout__main ${sidebarOpen ? "sidebar-open" : ""} ${pageMounted ? "fade-in" : ""}`}>
        <header className="admin-layout__header">
          <h1 className="admin-layout__title">{pageTitle}</h1>
          <div className="admin-layout__user-bar">
            <span className="admin-layout__greeting">Welcome back, {name.split(" ")[0]}</span>
            <button
              type="button"
              className="admin-layout__notification"
              aria-label="Notifications"
              title="Notifications"
            >
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            <div
              className="admin-layout__avatar-dropdown"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="admin-layout__avatar-btn"
                onClick={handleToggleDropdown}
                aria-label="User menu"
                aria-expanded={dropdownOpen}
              >
                <div className="admin-layout__avatar">{name.charAt(0).toUpperCase()}</div>
                <FaChevronDown className="admin-layout__chevron" />
              </button>
              {dropdownOpen && (
                <ul className="admin-layout__dropdown-menu">
                  <li>
                    <button
                      type="button"
                      className="admin-layout__dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (location.pathname !== "/profile") {
                          window.location.href = "/profile";
                        }
                      }}
                    >
                      <span>My Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="admin-layout__dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <span>Sign Out</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </header>
        <div className="admin-layout__content">
          {children && (
            <div className="page-content">{children}</div>
          )}
        </div>
      </main>
    </div>
  );
}
