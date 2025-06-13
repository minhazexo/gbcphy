import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./header.scss";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  // Toggle menu open state
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header>
      <div className="logo-container">
        <Link to="/">
          <img
            src="./images/gbclogo.png"
            alt="Dept Of Physics Logo"
            className="logo"
          />
        </Link>
      </div>
      <h1>Dept Of Physics</h1>

      {/* Hamburger icon */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={menuOpen ? "open" : ""}>
        <ul>
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/academic" onClick={() => setMenuOpen(false)}>
              Academic
            </Link>
          </li>
          {isAuthenticated ? (
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <Link to="/Teachers" onClick={() => setMenuOpen(false)}>
                  Teachers
                </Link>
              </li>
              <li>
                <Link to="/Snakegame" onClick={() => setMenuOpen(false)}>
                  Snakegame
                </Link>
              </li>
              <li>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
