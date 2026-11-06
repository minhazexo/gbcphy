// src/pages/ForgotPassword/ForgotPassword.tsx
import { useState } from "react";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.ts";
import "./forgot-password.scss";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!email.trim()) {
      setMessage("Email address is required.");
      setMessageType("error");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setMessage("Enter a valid email address.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
      const { error } = await supabase!.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setMessage("If an account exists for this email, a password reset link has been sent.");
      setMessageType("success");
    } catch (err: any) {
      setMessage(err.message || "Failed to send reset email. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <form className="forgot-form" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <p>Enter your email address and we will send you a link to reset your password.</p>

        {message && <p className={`forgot-footer ${messageType}`}>{message}</p>}

        <div className="form-group">
          <label>Email Address</label>
          <input
            className="input-field"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button className="forgot-button" type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Email"}
        </button>

        <p className="forgot-footer-link">
          Remember your password? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  );
}
