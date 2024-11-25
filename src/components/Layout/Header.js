import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Make sure the path is correct
import "./header.scss";

function Header() {
  const { isAuthenticated, logout } = useAuth(); // Destructure from useAuth
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <header>
      <div className="logo-container">
        <Link to="/">
          <img src="./images/gbclogo.png" alt="Dept Of Physics Logo" className="logo" />
        </Link>
      </div>
      <h1>Dept Of Physics</h1>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/academic">Academic</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
