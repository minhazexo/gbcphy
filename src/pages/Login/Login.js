import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";  // ✅ import AuthContext
import "../../styles/login.scss";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();  // ✅ use login from AuthContext

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setLoading(true);

  try {
    const success = await login(email, password); // calls AuthContext
    if (success) {
      navigate("/profile"); // redirect after login
    }
  } catch (error) {
    console.error("Login error:", error);
    setMessage(error.message || "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <div className="form-group">
          <label>Email</label>
          <input
            className="input-field"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="login-button" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="login-footer">{message}</p>}
      </form>
    </div>
  );
}
