// AdminLayout — layout for the admin dashboard.
// Contains AdminSidebar, AdminNavbar (top bar), Breadcrumbs, and page content.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.js";
import { useRBAC } from "../../context/RBACContext.js";
import { useTheme } from "../../context/ThemeContext.js";
import AdminSidebar from "./AdminSidebar.js";
import TopNavbar from "./TopNavbar.js";
import { ToastProvider, useToast } from "../../components/common/Toast/index.js";

export { ToastProvider, useToast };
import "./AdminLayout.scss";

const ROUTE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/students": "Student Management",
  "/admin/faculty": "Faculty Management",
  "/admin/approvals": "Registration Approvals",
  "/admin/content": "Content Management",
  "/admin/activity-logs": "Activity Logs",
  "/admin/settings": "Settings",
};

const getBreadcrumbs = (pathname) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];
  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const title = ROUTE_TITLES[currentPath];
    if (title) {
      breadcrumbs.push({ label: title, href: currentPath });
    }
  }
  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1].current = true;
  }
  return breadcrumbs;
};

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const MOBILE_BREAKPOINT = 768;

export default function AdminLayout({ children }) {
  const { userProfile, logout, isAuthenticated, authReady } = useAuth();
  const { userRole, loading: rbacLoading } = useRBAC();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const { addToast, removeToast, toasts } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false,
  );
  const mainRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  const handleSidebarToggle = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleOverlayClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname), [location.pathname]);

  const user = userProfile;
  const name = user?.full_name ?? "Admin User";
  const email = user?.email ?? "";
  const role = user?.role ?? userRole ?? "admin";
  const avatarUrl = user?.avatar_url ?? null;

  const sidebarWidth = sidebarCollapsed ? "72px" : "260px";
  const contentMarginLeft = isMobile ? "0" : sidebarWidth;

  if (!authReady || rbacLoading || !isAuthenticated) {
    return null;
  }

  return (
    <ToastProvider>
      <div className={`admin-layout theme-${theme} ${isMobile && sidebarOpen ? "admin-layout--sidebar-open" : ""}`}>
        <a href="#main-content" className="admin-layout__skip-link">
          Skip to main content
        </a>

        {isMobile && sidebarOpen && (
          <div className="admin-layout__overlay" onClick={handleOverlayClick} aria-hidden="true" />
        )}

        <header className="admin-layout__navbar">
          <TopNavbar
            onMenuToggle={handleMenuToggle}
            breadcrumbs={breadcrumbs}
            user={{ full_name: name, email, role, avatar_url: avatarUrl }}
            onLogout={handleLogout}
          />
        </header>

        <div className="admin-layout__body">
          <AdminSidebar onToggle={handleSidebarToggle} />

          <main
            className="admin-layout__main"
            id="main-content"
            tabIndex={-1}
            ref={mainRef}
            style={{ marginLeft: contentMarginLeft }}
          >
            <motion.div
              className="admin-layout__content"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={location.pathname}
            >
              {breadcrumbs.length > 0 && (
                <div className="admin-layout__breadcrumbs">
                  <ol className="admin-layout__breadcrumb-list">
                    {breadcrumbs.map((item, index) => {
                      const isLast = index === breadcrumbs.length - 1;
                      return (
                        <li key={item.href} className="admin-layout__breadcrumb-item">
                          {isLast ? (
                            <span className="admin-layout__breadcrumb-current" aria-current="page">
                              {item.label}
                            </span>
                          ) : (
                            <a href={item.href} className="admin-layout__breadcrumb-link">
                              {item.label}
                            </a>
                          )}
                          {!isLast && <span className="admin-layout__breadcrumb-separator">/</span>}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
              {children}
            </motion.div>
          </main>

          <div className="admin-layout__toasts">
            {toasts.map((t) => (
              <div
                key={t.id}
                className="admin-layout__toast"
                role="alert"
                aria-live="polite"
              >
                {t.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
