// src/pages/ResetPassword/ResetPassword.js
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../data/supabase.js";
import './ResetPassword.scss';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = searchParams.get("access_token");
    const type = searchParams.get("type");

    if (!isSupabaseConfigured) {
      setMessage("Supabase is not configured.");
      setMessageType("error");
      setStatus("error");
      return;
    }
    if (!token) {
      setMessage("Invalid or missing reset link.");
      setMessageType("error");
      setStatus("error");
      return;
    }

    setStatus("checking");
    supabase.auth.verifyOtp({ token_hash: token, type: type || "recovery" })
      .then(({ data, error }) => {
        if (error) throw error;
        setVerified(!!data.user);
        setStatus(data.user ? "verified" : "error");
        if (!data.user) setMessage("Invalid or expired reset link.");
      })
      .catch(err => {
        setMessage(err.message || "Invalid reset link.");
        setMessageType("error");
        setStatus("error");
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!newPassword || newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }
    if (!verified) {
      setMessage("Please verify the reset link first.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage("Password reset successful. You can now sign in.");
      setMessageType("success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.message || "Failed to reset password. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <h1>Reset Password</h1>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <h1>Reset Password</h1>
          {message && <p className={`reset-footer ${messageType}`}>{message}</p>}
          <p className="reset-footer-link">
            <a href="/forgot-password">Request a new link</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <form className="reset-form" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>

        {message && <p className={`reset-footer ${messageType}`}>{message}</p>}

        <div className="form-group">
          <label>New Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button className="reset-button" type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="reset-footer-link">
          Remember your password? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  );
}
