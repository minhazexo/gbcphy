// Role-Based Access Control context.
// Role hierarchy: super_admin > department_admin > faculty > student.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../data/supabase.ts";
import { getUserRole } from "../data/db.ts";

export const SUPER_ADMIN = "super_admin";
export const DEPARTMENT_ADMIN = "department_admin";
export const FACULTY = "faculty";
export const STUDENT = "student";

export type Role = typeof SUPER_ADMIN | typeof DEPARTMENT_ADMIN | typeof FACULTY | typeof STUDENT;

const PERMISSIONS: Record<Role, string[]> = {
  [SUPER_ADMIN]: [
    "canManageStudents",
    "canApproveRegistrations",
    "canManageFaculty",
    "canManageContent",
    "canViewDashboard",
    "canEditOwnProfile"
  ],
  [DEPARTMENT_ADMIN]: [
    "canManageStudents",
    "canApproveRegistrations",
    "canManageFaculty",
    "canManageContent",
    "canViewDashboard",
    "canEditOwnProfile"
  ],
  [FACULTY]: ["canManageContent", "canViewDashboard", "canEditOwnProfile"],
  [STUDENT]: ["canEditOwnProfile"]
};

interface RBACContextValue {
  userRole: Role | null;
  permissions: string[];
  loading: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  hasPermission: (permission: string) => boolean;
  canManageStudents: boolean;
  canApproveRegistrations: boolean;
  canManageFaculty: boolean;
  canManageContent: boolean;
  canViewDashboard: boolean;
  canEditOwnProfile: boolean;
}

const RBACContext = createContext<RBACContextValue | null>(null);

export const useRBAC = (): RBACContextValue => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};

export const RBACProvider = ({ children }: { children: React.ReactNode }) => {
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    try {
      const { data } = await supabase!.auth.getUser();
      const user = data.user;
      if (!user) {
        setUserRole(null);
        setPermissions([]);
        return;
      }
      const role = await getUserRole(user.id);
      setUserRole(role as Role | null);
      setPermissions(role ? (PERMISSIONS[role as Role] || []) : []);
    } catch (error: any) {
      console.error("Could not fetch user role:", error.message);
      setUserRole(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchRole().then(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fetchRole]);

  const isAdmin = userRole === SUPER_ADMIN || userRole === DEPARTMENT_ADMIN;
  const isFaculty = userRole === FACULTY;
  const isStudent = userRole === STUDENT;

  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission);
  }, [permissions]);

  const canManageStudents = permissions.includes("canManageStudents");
  const canApproveRegistrations = permissions.includes("canApproveRegistrations");
  const canManageFaculty = permissions.includes("canManageFaculty");
  const canManageContent = permissions.includes("canManageContent");
  const canViewDashboard = permissions.includes("canViewDashboard");
  const canEditOwnProfile = permissions.includes("canEditOwnProfile");

  const value: RBACContextValue = {
    userRole,
    permissions,
    loading,
    isAdmin,
    isFaculty,
    isStudent,
    hasPermission,
    canManageStudents,
    canApproveRegistrations,
    canManageFaculty,
    canManageContent,
    canViewDashboard,
    canEditOwnProfile
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export default RBACContext;
