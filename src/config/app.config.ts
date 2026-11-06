// Central application configuration.
// Edit site-wide constants here instead of hunting through components.

export const APP = {
  name: "Department of Physics",
  college: "Government Bangla College",
  version: "1.0.0",
};

export const ROUTES = {
  home: "/",
  about: "/about",
  teachers: "/teachers",
  academic: "/academic",
  classRoutine: "/class-routine",
  scientific: "/scientific",
  login: "/login",
  register: "/register",
  profile: "/profile",
  editProfile: "/edit-profile",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  emailVerification: "/email-verification",
  unauthorized: "/unauthorized",
  adminDashboard: "/admin/dashboard",
  adminStudents: "/admin/students",
  adminFaculty: "/admin/faculty",
  adminApprovals: "/admin/approvals",
  adminContent: "/admin/content",
  adminActivityLogs: "/admin/activity-logs",
  adminSettings: "/admin/settings",
};

export const ROLE_RANK = {
  super_admin: 4,
  department_admin: 3,
  faculty: 2,
  student: 1,
};

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  DEPARTMENT_ADMIN: "department_admin",
  FACULTY: "faculty",
  STUDENT: "student",
};

export type Role = keyof typeof ROLES;

export const YEARS = ["First Year", "Second Year", "Third Year", "Fourth Year"];

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default { APP, ROUTES, ROLE_RANK, ROLES, YEARS, DEFAULT_PAGE_SIZE, MAX_IMAGE_SIZE };
