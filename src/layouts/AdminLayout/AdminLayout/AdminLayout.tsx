// AdminLayout — layout for the admin dashboard.
// Contains AdminSidebar, AdminNavbar (top bar), Breadcrumbs, and page content.

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext.tsx";
import { useRBAC } from "../../../context/RBACContext.tsx";
import { useTheme } from "../../../context/ThemeContext.tsx";
import AdminSidebar from "../AdminSidebar";
import TopNavbar from "../TopNavbar";

// The ToastProvider itself is mounted once in AppRoutes, above the router, so
// that this layout and every page under it can call useToast(). Pages import
// the hook from here for historical reasons.
export { ToastProvider, useToast } from "../../../components/common/Toast/Toast.tsx";
import "./AdminLayout.scss";

const pageVariants: any = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const MOBILE_BREAKPOINT = 768;

export default function AdminLayout({ children }: { children?: React.ReactNode }) {
  const { userProfile, logout, isAuthenticated, authReady } = useAuth();
  const { userRole, loading: rbacLoading } = useRBAC();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= MOBILE_BREAKPOINT : false,
  );
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  const handleSidebarToggle = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prevOpen) => !prevOpen);
  }, []);

  const handleOverlayClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleEscKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSidebarOpen(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    try {
      await logout();
      navigate("/login");
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  }, [logout, navigate]);

  const user = userProfile;
  const name = user?.full_name ?? "Admin User";
  const email = user?.email ?? "";
  const role = user?.role ?? userRole ?? "admin";
  const avatarUrl = user?.avatar_url ?? null;

  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.setAttribute("tabindex", "-1");
    mainContent.focus();
  }

  if (!authReady || rbacLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className={`admin-layout theme-${theme} ${isMobile && sidebarOpen ? "admin-layout--sidebar-open" : ""}`} aria-label="Admin dashboard">
        <a href="#main-content" className="admin-layout__skip-link">
          Skip to main content
        </a>

        {isMobile && sidebarOpen && (
          <div className="admin-layout__overlay" onClick={handleOverlayClick} aria-label="Close sidebar" role="button" onKeyDown={handleEscKeyDown} aria-hidden="false" />
        )}

        <header className="admin-layout__navbar">
          <TopNavbar
            onMenuToggle={handleMenuToggle}
            user={{ full_name: name, email, role, avatar_url: avatarUrl }}
            onLogout={handleLogout}
          />
        </header>

        <div className="admin-layout__body">
          <AdminSidebar onToggle={handleSidebarToggle} open={sidebarOpen} collapsed={sidebarCollapsed} />

          <main
            className="admin-layout__main"
            id="main-content"
            ref={mainRef}
          >
            <motion.div
              className="admin-layout__content"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={location.pathname}
            >
              {children}
            </motion.div>
          </main>

          {/* Accessible skip navigation for keyboard users */}
          <button className="admin-layout__skip-trigger" onClick={() => mainRef.current?.focus()}
                  aria-label="Focus main content" style={{ position: "absolute", left: "-1000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
            Skip to content
          </button>
        </div>
    </div>
  );
}
