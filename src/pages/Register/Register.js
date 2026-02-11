// src/pages/Register/Register.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api";
import "../../styles/register.scss";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await registerUser({ username, email, password });
      setMessage(res.message); // backend success message
      // Redirect to profile dashboard after 1.5s
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setMessage(err.message); // show actual backend error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Register</h1>

        <div className="form-group">
          <label>Username</label>
          <input
            className="input-field"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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

        <button className="register-button" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {message && <p className="register-footer">{message}</p>}
      </form>
    </div>
  );
}
