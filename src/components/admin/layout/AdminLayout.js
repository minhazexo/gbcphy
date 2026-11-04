import { useState, useEffect, useCallback, useMemo, useRef, useContext, createContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext.js";
import { useRBAC } from "../../../context/RBACContext.js";
import { useTheme } from "../../../context/ThemeContext.js";
import AdminSidebar from "./AdminSidebar.js";
import TopNavbar from "./TopNavbar.js";
import Breadcrumbs from "../ui/Breadcrumbs.js";
import Toast from "../ui/Toast.js";
import "./AdminLayout.scss";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const TOAST_LIMIT = 50;

  const addToast = useCallback(
    (toast) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const newToast = { id, ...toast };
      setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT));
      return id;
    },
    []
  );

  const removeToast = useCallback(
    (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

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

  const { toasts, addToast, removeToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false
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
    <div className={`admin-layout theme-${theme}${isMobile && sidebarOpen ? " admin-layout--sidebar-open" : ""}`}>
      <a href="#main-content" className="admin-layout__skip-link">Skip to main content</a>

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
              <Breadcrumbs items={breadcrumbs} className="admin-layout__breadcrumbs" size="sm" />
            )}
            {children}
          </motion.div>
        </main>

        <div className="admin-layout__toasts">
          <Toast toasts={toasts} onDismiss={removeToast} position="top-right" />
        </div>
      </div>
    </div>
  );
}
