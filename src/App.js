import React from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext.js";
import { AuthProvider } from "./context/AuthContext.js";
import "./App.css";
import "./styles/classRoutine.scss";
import Layout from "./components/Layout/Layout.js";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.js";
import { ToastProvider } from "./components/admin/layout/AdminLayout.js";

import Home from "./pages/Home/Home.js";
import Scientific from "./pages/Scientific/Scientific.js";
import About from "./pages/About/About.js";
import Academic from "./pages/Academic/Academic.js";
import Teachers from "./pages/Teachers/Teachers.js";
import NotFound from "./pages/NotFound/NotFound.js";
import ClassRoutine from "./pages/ClassRoutine.js";
import Admin from "./pages/Admin/Admin.js";
import Login from "./pages/Login/Login.js";
import Register from "./pages/Register/Register.js";
import Profile from "./pages/Profile/Profile.js";
import EditProfile from "./pages/EditProfile/EditProfile.js";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.js";
import ResetPassword from "./pages/ResetPassword/ResetPassword.js";
import EmailVerification from "./pages/EmailVerification/EmailVerification.js";
import Dashboard from "./pages/Admin/Dashboard.js";
import StudentManagement from "./pages/StudentManagement/StudentManagement.js";
import FacultyManagement from "./pages/Admin/FacultyManagement.js";
import RegistrationApproval from "./pages/RegistrationApproval/RegistrationApproval.js";
import ContentManagement from "./pages/Admin/ContentManagement.js";
import ActivityLogs from "./pages/Admin/ActivityLogs.js";
import Settings from "./pages/Settings/Settings.js";
import Unauthorized from "./pages/Unauthorized/Unauthorized.js";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Admin routes â€” authentication + role based authorization */}
          <Route element={<ToastProvider><Outlet /></ToastProvider>}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
                  <RegistrationApproval />
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
            <Route path="/admin" element={<Admin />} />

          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/scientific" element={<Scientific />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/class-routine" element={<ClassRoutine />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;



