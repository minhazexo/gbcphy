// All application routes combined.
// Order matters: auth routes first, then protected admin routes,
// then public routes with MainLayout, then the catch-all.

import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext.tsx";
import { ThemeProvider } from "../../context/ThemeContext.tsx";
import { ToastProvider } from "../../components/common/Toast/Toast.tsx";
import ProtectedRoute from "../../components/ProtectedRoute/ProtectedRoute.tsx";

// Auth pages
import Login from "../../features/authentication/pages/Login.tsx";
import Register from "../../features/authentication/pages/Register.tsx";
import ForgotPassword from "../../features/authentication/pages/ForgotPassword.tsx";
import ResetPassword from "../../features/authentication/pages/ResetPassword.tsx";
import EmailVerification from "../../features/authentication/pages/EmailVerification.tsx";
import Unauthorized from "../../features/home/pages/Unauthorized.tsx";

// Admin pages
import AdminDashboard from "../../features/admin/pages/AdminDashboard";
import StudentManagement from "../../features/students/pages/StudentManagement.tsx";
import FacultyManagement from "../../features/faculty/pages/FacultyManagement.tsx";
import RegistrationApprovals from "../../features/admin/pages/RegistrationApprovals";
import ContentManagement from "../../features/admin/pages/ContentManagement";
import ActivityLogs from "../../features/admin/pages/ActivityLogs";
import Settings from "../../features/settings/pages/Settings.tsx";
import AdminHome from "../../features/admin/pages/AdminHome";

// Public pages
import Home from "../../features/home/pages/Home.tsx";
import About from "../../features/about/pages/About.tsx";
import TeacherDirectory from "../../features/faculty/pages/TeacherDirectory.tsx";
import Scientific from "../../features/scientific/pages/Scientific.tsx";
import Academic from "../../features/academic/pages/Academic.tsx";
import ClassRoutine from "../../features/academic/pages/ClassRoutine.tsx";
import Profile from "../../features/profile/pages/Profile.tsx";
import EditProfile from "../../features/profile/pages/EditProfile.tsx";
import NotFound from "../../features/home/pages/NotFound.tsx";

// Layouts
import MainLayout from "../../layouts/MainLayout";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout.tsx";

export const AppRoutes = () => (
  <ThemeProvider>
    {/* AuthProvider already renders RBACProvider; wrapping again would create
        two independent role stores that disagree after sign-in. */}
    <AuthProvider>
      {/* Toasts live above the routes so any page (and AdminLayout itself) can
          call useToast(). */}
      <ToastProvider>
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

          {/* Admin pages — each page renders AdminLayout itself, so these are
              plain routes rather than a layout route. */}
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

          {/* Public website — MainLayout (Header + Footer) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/teachers" element={<TeacherDirectory />} />
            <Route path="/scientific" element={<Scientific />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/class-routine" element={<ClassRoutine />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default AppRoutes;
