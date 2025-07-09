// Header.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./header.scss";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = 100;

    let letters =
      "ABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZABCDEFGHIJKLMNOPQRSTUVXYZ";
    letters = letters.split("");
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let i = 0; i < columns; i++) drops[i] = 1;

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, .1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        drops[i]++;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
      }
    }

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return (
    <header>
      <canvas ref={canvasRef}></canvas>

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
                <Link to="/games" onClick={() => setMenuOpen(false)}>
                  Games
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