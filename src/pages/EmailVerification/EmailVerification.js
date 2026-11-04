// src/pages/EmailVerification/EmailVerification.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { supabase, isSupabaseConfigured } from "../../data/supabase.js";
import './EmailVerification.scss';

export default function EmailVerification() {
  const { userProfile, isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getUser();
          setStatus(data.user.email_confirmed_at ? "verified" : "pending");
        } else {
          setStatus("pending");
        }
      } catch (err) {
        setMessage(err.message || "Unable to check verification status.");
        setMessageType("error");
      }
    })();
  }, [authReady, isAuthenticated, navigate]);

  const resendVerification = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userProfile.email
      });
      if (error) throw error;
      setMessage("Verification email resent. Check your inbox.");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message || "Failed to resend verification email.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1>Email Verification</h1>

        {status === "checking" ? (
          <p>Checking verification status...</p>
        ) : status === "verified" ? (
          <>
            <p className="status-verified">Your email is verified.</p>
            <p className="verify-hint">You can now sign in and access your profile.</p>
            <p className="verify-footer-link">
              <a href="/login">Go to Sign In</a>
            </p>
          </>
        ) : (
          <>
            <p className="status-pending">Your email has not been verified yet.</p>
            <p className="verify-hint">
              A confirmation link was sent to <strong>{userProfile.email}</strong>. Open your email and click the link, then sign in.
            </p>
            {message && <p className={`verify-footer ${messageType}`}>{message}</p>}
            <button className="verify-button" onClick={resendVerification} disabled={loading}>
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>
            <p className="verify-footer-link">
              Already verified? <a href="/login">Sign in</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
