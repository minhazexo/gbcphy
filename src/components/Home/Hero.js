import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import { 
  FaChevronLeft, FaChevronRight, FaArrowRight 
} from "react-icons/fa";
import "./Hero.scss";

const Hero = ({ departmentInfo, scrolled }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  // High-performance mouse tracking using MotionValues
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoothing the mouse movement
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Transform values for the parallax layers
  const parallaxX = useTransform(smoothX, [-10, 10], [5, -5]);
  const parallaxY = useTransform(smoothY, [-10, 10], [5, -5]);

  const images = [
    "/images/5.jpg",
    "/images/6.jpg", 
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg",
    "/images/10.jpg"
  ];

  // Auto slide every 5s (pauses on hover/focus, reduced-motion, or manual pause)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const imageSlider = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(imageSlider);
  }, [images.length, paused, reducedMotion]);

  // Mouse move effect (disabled for reduced-motion / touch)
  useEffect(() => {
    if (reducedMotion) return;
    const handleMouseMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reducedMotion]);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleQuickLink = (link) => {
    if (link.kind === "route") {
      navigate(link.target);
    } else {
      document.getElementById(link.target)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Variants for staggered text animation
  const titleContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.6 }
    }
  };

  const titleWord = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="hero-banner" role="banner">
      <motion.section 
        id="hero"
        className={`hero-section ${scrolled ? 'scrolled' : ''}`}
        ref={heroRef}
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 1 }}
        aria-roledescription="carousel"
        aria-label="Department highlights"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goToNextImage();
          if (e.key === "ArrowLeft") goToPrevImage();
        }}
      >
        <div
          className="hero-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <button className="nav-btn prev-btn" aria-label="Previous slide" onClick={goToPrevImage}>
            <FaChevronLeft />
          </button>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className="hero-slide"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: reducedMotion ? 0 : 0.6 }}
              style={reducedMotion ? undefined : { x: parallaxX, y: parallaxY }}
            >
              <img 
                src={images[currentImageIndex]} 
                alt={`Government Bangla College campus and Physics department life — view ${currentImageIndex + 1} of ${images.length}`} 
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                className="slide-image"
              />
              <div className="slide-overlay" aria-hidden="true"></div>
            </motion.div>
          </AnimatePresence>
          
          <div className="slide-controls">
            <div className="slide-indicators" role="tablist" aria-label="Hero slides">
              {images.map((_, index) => (
                <motion.button
                  type="button"
                  key={index} 
                  role="tab"
                  aria-selected={index === currentImageIndex}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                  whileHover={reducedMotion ? undefined : { scale: 1.2 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.9 }}
                />
              ))}
            </div>
            <button
              type="button"
              className="autoplay-toggle"
              aria-label={paused || reducedMotion ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={paused}
              onClick={() => setPaused((p) => !p)}
            >
              {paused || reducedMotion ? "▶" : "❚❚"}
            </button>
          </div>
          
          <button className="nav-btn next-btn" aria-label="Next slide" onClick={goToNextImage}>
            <FaChevronRight />
          </button>

          <motion.div 
            className="hero-content"
            initial={reducedMotion ? { opacity: 1 } : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: reducedMotion ? 0 : 0.7 }}
          >
            <motion.div 
              className="hero-badge"
              initial={reducedMotion ? { opacity: 1 } : { scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            >
              {departmentInfo.affiliation || "Excellence in Education"}
            </motion.div>
            
            <motion.h1 variants={titleContainer} initial="hidden" animate="visible">
              <span className="department-name">
                {departmentInfo.name.split(" ").map((word, i) => (
                  <motion.span key={i} variants={reducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : titleWord} style={{ display: "inline-block", marginRight: "0.25em" }}>
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="college-name">
                {departmentInfo.college}
              </span>
            </motion.h1>
            
            <motion.p 
              className="hero-tagline"
              initial={reducedMotion ? { opacity: 1 } : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: reducedMotion ? 0 : 0.6 }}
            >
              {departmentInfo.visionShort || `Excellence in Physics Education Since ${departmentInfo.established}`}
            </motion.p>

            <ul className="hero-trust" aria-label="Department facts">
              <li>Since {departmentInfo.established}</li>
              <li>{departmentInfo.facultyCount}+ faculty</li>
              <li>B.Sc. Honours + M.Sc.</li>
            </ul>

            <motion.div 
              className="hero-cta"
              initial={reducedMotion ? { opacity: 1 } : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: reducedMotion ? 0 : 0.6 }}
            >
              <motion.button 
                className="cta-button"
                whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('programs').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })}
              >
                Explore Programs <FaArrowRight />
              </motion.button>
              <motion.button 
                className="cta-button secondary"
                whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/class-routine')}
              >
                View Class Routine
              </motion.button>
            </motion.div>

            <motion.nav
              className="hero-quicklinks"
              aria-label="Quick links"
              initial={reducedMotion ? { opacity: 1 } : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: reducedMotion ? 0 : 0.6 }}
            >
              {departmentInfo.quickLinks.map((link, index) => (
                <button
                  key={index}
                  type="button"
                  className="quicklink"
                  onClick={() => handleQuickLink(link)}
                >
                  <span className="quicklink-icon" aria-hidden="true">{link.icon}</span>
                  {link.label}
                </button>
              ))}
            </motion.nav>
          </motion.div>

          {!reducedMotion && (
            <motion.div 
              className="scroll-indicator"
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              aria-hidden="true"
            >
              <div className="mouse">
                <div className="wheel"></div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Hero;
