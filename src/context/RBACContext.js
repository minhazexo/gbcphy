// Role-Based Access Control context.
// Role hierarchy: super_admin > department_admin > faculty > student.

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../data/supabase.js";
import { getUserRole } from "../data/db.js";

export const SUPER_ADMIN = "super_admin";
export const DEPARTMENT_ADMIN = "department_admin";
export const FACULTY = "faculty";
export const STUDENT = "student";

const ROLE_RANK = {
  [SUPER_ADMIN]: 4,
  [DEPARTMENT_ADMIN]: 3,
  [FACULTY]: 2,
  [STUDENT]: 1
};

const PERMISSIONS = {
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

const RBACContext = createContext(null);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};

export const RBACProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setUserRole(null);
        setPermissions([]);
        return;
      }
      const role = await getUserRole(user.id);
      setUserRole(role || null);
      setPermissions(role ? (PERMISSIONS[role] || []) : []);
    } catch (error) {
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

  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  const canManageStudents = permissions.includes("canManageStudents");
  const canApproveRegistrations = permissions.includes("canApproveRegistrations");
  const canManageFaculty = permissions.includes("canManageFaculty");
  const canManageContent = permissions.includes("canManageContent");
  const canViewDashboard = permissions.includes("canViewDashboard");
  const canEditOwnProfile = permissions.includes("canEditOwnProfile");

  const value = {
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