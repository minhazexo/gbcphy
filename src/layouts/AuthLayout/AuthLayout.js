// AuthLayout — layout for authentication pages (Login, Register, ForgotPassword,
// ResetPassword, EmailVerification).
// Centered card layout with no Header/Footer navigation.

import { Outlet } from "react-router-dom";
import "./AuthLayout.scss";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <main className="auth-layout__main">
        <div className="auth-layout__card">{children || <Outlet />}</div>
      </main>
    </div>
  );
}
