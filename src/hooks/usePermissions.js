// Permissions hook. Thin wrapper around RBACContext for centralized
// authorization checks in UI components.

import { useRBAC } from "../context/RBACContext.js";

export const usePermissions = () => {
  const rbac = useRBAC();
  return {
    userRole: rbac.userRole,
    permissions: rbac.permissions,
    loading: rbac.loading,
    isAdmin: rbac.isAdmin,
    isFaculty: rbac.isFaculty,
    isStudent: rbac.isStudent,
    hasPermission: rbac.hasPermission,
    canManageStudents: rbac.canManageStudents,
    canApproveRegistrations: rbac.canApproveRegistrations,
    canManageFaculty: rbac.canManageFaculty,
    canManageContent: rbac.canManageContent,
    canViewDashboard: rbac.canViewDashboard,
    canEditOwnProfile: rbac.canEditOwnProfile,
  };
};

export default usePermissions;
