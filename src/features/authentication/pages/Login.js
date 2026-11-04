// src/pages/Login/Login.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../../../data/supabase.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../../styles/login.scss";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");

      let email = identifier.trim();

      if (mode === "student") {
        const { data, error } = await supabase
          .from("students")
          .select("email")
          .eq("student_id", identifier.trim())
          .single();
        if (error || !data) throw new Error("No account found for this Student ID.");
        email = data.email;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;
      if (!user.email_confirmed_at) {
        setMessage("Please verify your email before signing in.");
        setMessageType("warning");
        setTimeout(() => navigate("/email-verification"), 1200);
        return;
      }

      navigate(mode === "student" ? "/profile" : "/admin/dashboard");
    } catch (err) {
      setMessage(err.message || "Login failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Welcome Back</h1>

        {message && <p className={`login-footer ${messageType}`}>{message}</p>}

        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${mode === "student" ? "active" : ""}`}
            onClick={() => setMode("student")}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === "admin" ? "active" : ""}`}
            onClick={() => setMode("admin")}
          >
            Admin Login
          </button>
        </div>

        <div className="form-group">
          <label>{mode === "student" ? "Student ID / Roll Number" : "Email Address"}</label>
          <input
            className="input-field"
            type={mode === "student" ? "text" : "email"}
            placeholder={mode === "student" ? "Enter student ID" : "Enter email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="form-group password-group">
          <label>Password</label>
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="login-footer-link">
          Don't have an account? <a href="/register">Register</a>
        </p>
        <p className="login-footer-link">
          <a href="/forgot-password">Forgot password?</a>
        </p>
      </form>
    </div>
  );
}
