// Route protection: ProtectedRoute checks authentication,
// and optionally role/permission-based authorization.
// RoleGuard checks specific roles with hierarchical access.

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import { useRBAC } from "../../context/RBACContext.tsx";

// Role hierarchy rank: higher rank can access lower-role routes.
const ROLE_RANK: Record<string, number> = {
  super_admin: 4,
  admin: 4,
  department_admin: 3,
  faculty: 2,
  student: 1
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: string;
  requiredRole?: string;
  requiredPermission?: string;
}

export const ProtectedRoute = ({
  children,
  fallback = "/login",
  requiredRole,
  requiredPermission
}: ProtectedRouteProps) => {
  const { isAuthenticated, authReady } = useAuth();
  const { userRole, loading: rbacLoading, hasPermission } = useRBAC();
  const location = useLocation();

  if (!authReady || rbacLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  // Role-based authorization: user's rank must meet or exceed required role rank.
  if (requiredRole) {
    const userRank = ROLE_RANK[userRole ?? ""] ?? 0;
    const requiredRank = ROLE_RANK[requiredRole] ?? 0;
    if (userRank < requiredRank) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Permission-based authorization.
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: string;
}

export const RoleGuard = ({ roles, children, fallback = "/unauthorized" }: RoleGuardProps) => {
  const { userRole, loading } = useRBAC();
  const location = useLocation();

  if (loading) return null;

  const allowed = roles.some((role) => {
    const userRank = ROLE_RANK[userRole ?? ""] ?? 0;
    const requiredRank = ROLE_RANK[role] ?? 0;
    return userRank >= requiredRank;
  });

  if (!allowed) {
    return <Navigate to={fallback} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
