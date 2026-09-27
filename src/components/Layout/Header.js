// Header.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaHome, FaGraduationCap, FaChalkboardTeacher, FaCalendarAlt, FaFlask, FaInfoCircle, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext.js";
import "./header.scss";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const particlesRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState(location.pathname);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 1]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  const navigationItems = [
    { path: "/", label: "Home", icon: FaHome },
    { path: "/academic", label: "Academic", icon: FaGraduationCap },
    { path: "/teachers", label: "Teachers", icon: FaChalkboardTeacher },
    { path: "/class-routine", label: "Routine", icon: FaCalendarAlt },
    { path: "/scientific", label: "Scientific", icon: FaFlask, externalUrl: "https://sciencebee.netlify.app/" },
    { path: "/about", label: "About", icon: FaInfoCircle }
  ];

  useEffect(() => {
    setActiveSection(location.pathname);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = 80;

    let letters = "55286324174175286396385274285363682752525363669574152683968527525268";
    letters = letters.split("");
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isScrolled ? "#00ffff" : "#00ff88";
      ctx.font = `${fontSize}px 'Courier New'`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, [isScrolled]);

  useEffect(() => {
    if (!particlesRef.current) return;
    const particlesCanvas = particlesRef.current;
    const ctx = particlesCanvas.getContext("2d");
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = 80;

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function animateParticles() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > particlesCanvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > particlesCanvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }, []);

  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleNavClick = (item) => {
    setMenuOpen(false);
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    } else {
      setActiveSection(item.path);
      navigate(item.path);
    }
  };

  const renderNavItem = (item, isMobileMenu = false) => {
    const Icon = item.icon;
    const isActive = activeSection === item.path;

    return (
      <motion.li
        key={item.path}
        variants={{
          open: { y: 0, opacity: 1 },
          closed: { y: 20, opacity: 0 }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={`nav-link ${isActive ? 'active' : ''} ${isMobileMenu ? 'mobile-link' : ''}`}
          onClick={() => handleNavClick(item)}
        >
          <div className="nav-icon">
            <Icon />
          </div>
          <span className="nav-text">{item.label}</span>
          {isActive && (
            <motion.div
              className="active-indicator"
              layoutId="activeIndicator"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </div>
      </motion.li>
    );
  };

  return (
    <>
      <motion.header
        className={`site-header fixed-dark-theme ${isScrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}
        style={{ opacity: headerOpacity, scale: headerScale }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Matrix Rain Background */}
        <canvas ref={canvasRef} className="matrix-canvas"></canvas>

        {/* Floating Particles */}
        <canvas ref={particlesRef} className="particles-canvas"></canvas>

        {/* Animated Background Gradient */}
        <div className="header-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="header-content">
          {/* Logo Section */}
          <motion.div
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <motion.img
                src="/images/gbclogo.png"
                alt="Dept Of Physics Logo"
                className="logo"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ rotate: 360 }}
              />
            </Link>
          </motion.div>

          {/* Theme Toggle */}
          <button
            type="button"
            className={`theme-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label="Toggle light / dark mode"
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {/* Hamburger Menu */}
          <motion.div
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span></span>
            <span></span>
            <span></span>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="nav-menu desktop-nav">
              <ul>
                {navigationItems.map(item => renderNavItem(item))}
              </ul>
            </nav>
          )}
        </div>
      </motion.header>

      {/* Mobile Navigation - Rendered outside header to avoid overflow clipping */}
      {isMobile && (
        <>
          <div
            className={`mobile-nav-overlay ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(false)}
          />
          <nav className={`nav-menu mobile-nav ${menuOpen ? 'open' : ''}`}>
            <ul>
              {navigationItems.map(item => renderNavItem(item, true))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}

export default Header;