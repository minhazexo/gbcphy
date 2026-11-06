// Header for the public website.
// Navigation, logo, theme toggle, mobile menu.

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  FaHome,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaFlask,
  FaInfoCircle,
  FaMoon,
  FaSun,
  FaEnvelope,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useTheme } from "../../../context/ThemeContext.tsx";
import "./Header.scss";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  externalUrl?: string;
}

const navigationItems: NavigationItem[] = [
  { path: "/", label: "Home", icon: FaHome },
  { path: "/academic", label: "Academic", icon: FaGraduationCap },
  { path: "/teachers", label: "Teachers", icon: FaChalkboardTeacher },
  { path: "/class-routine", label: "Routine", icon: FaCalendarAlt },
  { path: "/scientific", label: "Scientific", icon: FaFlask, externalUrl: "https://sciencebee.netlify.app/" },
  { path: "/about", label: "About", icon: FaInfoCircle },
];

const EXPO = [0.19, 1, 0.22, 1];

const sheetVariants: any = {
  hidden: { opacity: 0, y: -18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EXPO,
      when: "beforeChildren",
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: {
      duration: 0.22,
      ease: "easeIn",
      when: "afterChildren",
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const listVariants: any = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
  exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};

const pillVariants: any = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EXPO } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

const MOBILE_BREAKPOINT = 768;

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const reduceMotion = useReducedMotion();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT,
  );
  const [activeSection, setActiveSection] = useState(location.pathname);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 1]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  useEffect(() => {
    setActiveSection(location.pathname);
  }, [location]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      wasOpen.current = true;
      const frame = requestAnimationFrame(() => sheetRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      toggleRef.current?.focus();
    }
    return undefined;
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [menuOpen]);

  const handleSheetKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const focusable = sheetRef.current?.querySelectorAll(
      'a[href], button:not([disabled])',
    );
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Matrix rain canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const context = ctx;
    canvas.width = window.innerWidth;
    canvas.height = 80;

    const letters = "55286324174175286396385274285363682752525363669574152683968527525268".split("");
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(1);

    function draw() {
      context.fillStyle = "rgba(0, 0, 0, 0.05)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = isScrolled ? "#00ffff" : "#00ff88";
      context.font = `${fontSize}px 'Courier New'`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        context.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, [isScrolled]);

  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (item: NavigationItem) => {
    setMenuOpen(false);
    if (item.externalUrl) {
      window.open(item.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      setActiveSection(item.path);
      navigate(item.path);
    }
  };

  const renderDesktopNavItem = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.path;

    return (
      <motion.li
        key={item.path}
        variants={{
          open: { y: 0, opacity: 1 },
          closed: { y: 20, opacity: 0 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={`nav-link ${isActive ? "active" : ""}`}
          onClick={() => handleNavClick(item)}
        >
          <div className="nav-icon"><Icon /></div>
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

  const renderMobilePill = (item: NavigationItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.path;
    const className = `mnav-pill${isActive ? " is-active" : ""}`;

    const content = (
      <>
        <span className="mnav-pill-icon"><Icon aria-hidden="true" /></span>
        <span className="mnav-pill-label">{item.label}</span>
        {item.externalUrl && (
          <FaExternalLinkAlt className="mnav-pill-ext" aria-hidden="true" />
        )}
        {isActive && <span className="mnav-pill-dot" aria-hidden="true" />}
      </>
    );

    return (
      <motion.li key={item.path} className="mnav-item" variants={pillVariants}>
        {item.externalUrl ? (
          <button
            type="button"
            className={className}
            onClick={() => handleNavClick(item)}
            aria-label={`${item.label} (opens in a new tab)`}
          >
            {content}
          </button>
        ) : (
          <Link
            to={item.path}
            className={className}
            onClick={closeMenu}
            aria-current={isActive ? "page" : undefined}
          >
            {content}
          </Link>
        )}
      </motion.li>
    );
  };

  const sheetMotion: any = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    : {
        variants: sheetVariants,
        initial: "hidden",
        animate: "show",
        exit: "exit",
      };

  return (
    <>
      <motion.header
        className={`site-header fixed-dark-theme ${isScrolled ? "scrolled" : ""} ${menuOpen ? "menu-open" : ""}`}
        style={{ opacity: headerOpacity, scale: headerScale }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <canvas ref={canvasRef} className="matrix-canvas" />
        <div className="header-bg">
          <div className="gradient-orb orb-1" />
          <div className="gradient-orb orb-2" />
          <div className="gradient-orb orb-3" />
        </div>

        <div className="header-content">
          <motion.div
            className="logo-container"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <img src="/images/gbclogo.png" alt="Dept Of Physics Logo" className="logo" loading="eager" />
            </Link>
          </motion.div>

          {!isMobile && (
            <button
              type="button"
              className={`theme-toggle ${theme}`}
              onClick={toggleTheme}
              aria-label="Toggle light / dark mode"
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </button>
          )}

          {!isMobile && (
            <nav className="nav-menu desktop-nav">
              <ul>
                {navigationItems.map((item) => renderDesktopNavItem(item))}
              </ul>
            </nav>
          )}
        </div>

        {isMobile && (
          <div className="mnav-bar">
            <motion.div
              className="mnav-logo-wrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" onClick={closeMenu}>
                <img src="/images/gbclogo.png" alt="Dept Of Physics Logo" className="mnav-logo" loading="eager" />
              </Link>
            </motion.div>

            <div className="mnav-controls">
              <button
                type="button"
                className={`mnav-theme-toggle ${theme}`}
                onClick={toggleTheme}
                aria-label="Toggle light / dark mode"
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>

              <button
                ref={toggleRef}
                type="button"
                className={`mnav-toggle ${menuOpen ? "is-open" : ""}`}
                onClick={toggleMenu}
                aria-expanded={menuOpen}
                aria-controls="mnav-sheet"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
              >
                <span className="mnav-toggle-box" aria-hidden="true">
                  <span className="mnav-bar-line" />
                  <span className="mnav-bar-line" />
                  <span className="mnav-bar-line" />
                </span>
              </button>
            </div>
          </div>
        )}
      </motion.header>

      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            key="mnav-backdrop"
            className="mnav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}

        {isMobile && menuOpen && (
          <motion.div
            key="mnav-sheet"
            id="mnav-sheet"
            ref={sheetRef}
            className="mnav-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mnav-sheet-title"
            tabIndex={-1}
            onKeyDown={handleSheetKeyDown}
            {...sheetMotion}
          >
            <h2 className="mnav-sheet-title" id="mnav-sheet-title">Menu</h2>

            <motion.ul className="mnav-pills" variants={listVariants}>
              {navigationItems.map((item) => renderMobilePill(item))}

              <motion.li className="mnav-item" variants={pillVariants}>
                <a
                  className="mnav-pill mnav-cv"
                  href="mailto:mehrabhossain7102@gmail.com"
                  onClick={closeMenu}
                >
                  <span className="mnav-pill-icon"><FaEnvelope aria-hidden="true" /></span>
                  <span className="mnav-pill-label">Email Me</span>
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
