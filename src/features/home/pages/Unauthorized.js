// Unauthorized page — RBAC denial page.

import { useNavigate } from "react-router-dom";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import "../../../styles/unauthorized.scss";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <FaShieldAlt />
        </div>
        <h1>Unauthorized</h1>
        <p>You do not have sufficient permissions to access this page.</p>
        <p className="unauthorized-hint">If you believe this is a mistake, please contact the department administrator.</p>
        <div className="unauthorized-actions">
          <button className="unauthorized-btn" onClick={() => navigate("/")}>
            Back to home
          </button>
          <button className="unauthorized-btn primary" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
