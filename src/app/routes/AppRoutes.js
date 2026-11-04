// All application routes combined.
// Order matters: auth routes first, then protected admin routes,
// then public routes with MainLayout, then the catch-all.

import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext.js";
import { ThemeProvider } from "../../context/ThemeContext.js";
import { RBACProvider } from "../../context/RBACContext.js";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute.js";

// Auth pages
import Login from "../../features/authentication/pages/Login.js";
import Register from "../../features/authentication/pages/Register.js";
import ForgotPassword from "../../features/authentication/pages/ForgotPassword.js";
import ResetPassword from "../../features/authentication/pages/ResetPassword.js";
import EmailVerification from "../../features/authentication/pages/EmailVerification.js";
import Unauthorized from "../../features/home/pages/Unauthorized.js";

// Admin pages
import AdminDashboard from "../../features/admin/pages/AdminDashboard.js";
import StudentManagement from "../../features/students/pages/StudentManagement.js";
import FacultyManagement from "../../features/faculty/pages/FacultyManagement.js";
import RegistrationApprovals from "../../features/admin/pages/RegistrationApprovals.js";
import ContentManagement from "../../features/admin/pages/ContentManagement.js";
import ActivityLogs from "../../features/admin/pages/ActivityLogs.js";
import Settings from "../../features/settings/pages/Settings.js";
import AdminHome from "../../features/admin/pages/AdminHome.js";

// Public pages
import Home from "../../features/home/pages/Home.js";
import About from "../../features/about/pages/About.js";
import TeacherDirectory from "../../features/faculty/pages/TeacherDirectory.js";
import Scientific from "../../features/scientific/pages/Scientific.js";
import Academic from "../../features/academic/pages/Academic.js";
import ClassRoutine from "../../features/academic/pages/ClassRoutine.js";
import NotFound from "../../features/home/pages/NotFound.js";

// Layouts
import MainLayout from "../../layouts/MainLayout/MainLayout.js";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout.js";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout.js";

export const AppRoutes = () => (
  <ThemeProvider>
    <AuthProvider>
      <RBACProvider>
        <Routes>
          {/* Authentication pages — AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Admin routes — AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute requiredRole="department_admin">
                  <StudentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/faculty"
              element={
                <ProtectedRoute requiredRole="department_admin">
                  <FacultyManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute requiredRole="department_admin">
                  <RegistrationApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <ProtectedRoute requiredRole="department_admin">
                  <ContentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity-logs"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <ActivityLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<AdminHome />} />
          </Route>

          {/* Public website — MainLayout (Header + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/teachers" element={<TeacherDirectory />} />
            <Route path="/scientific" element={<Scientific />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/class-routine" element={<ClassRoutine />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </RBACProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default AppRoutes;
