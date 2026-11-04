import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaChevronLeft, FaChevronRight, FaArrowRight 
} from "react-icons/fa";
import "./Hero.scss";

const deptImages = [
  "/images/Dept-Img/1.jpg",
  "/images/Dept-Img/2.jpg",
  "/images/Dept-Img/3.jpg",
  "/images/Dept-Img/4.jpg",
  "/images/Dept-Img/5.jpg",
  "/images/Dept-Img/6.jpg",
  "/images/Dept-Img/7.jpg",
  "/images/Dept-Img/8.jpg",
  "/images/Dept-Img/9.jpg",
  "/images/Dept-Img/10.jpg"
];

// Fisher-Yates shuffle
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const Hero = ({ departmentInfo, scrolled }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [shuffledImages, setShuffledImages] = useState(shuffle(deptImages));
  const [reducedMotion, setReducedMotion] = useState(false);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  // Initial shuffle on mount
  useEffect(() => {
    setShuffledImages(shuffle(deptImages));
  }, []);

  // Auto slide forever at random 3–5s intervals; picks a random image each time
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = () => {
      const timer = setTimeout(() => {
        setCurrentImageIndex((prevIndex) => {
          let next;
          do {
            next = Math.floor(Math.random() * shuffledImages.length);
          } while (next === prevIndex && shuffledImages.length > 1);
          return next;
        });
        interval();
      }, 3000 + Math.random() * 2000);
      return () => clearTimeout(timer);
    };
    return interval();
  }, [shuffledImages.length, reducedMotion]);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      let next;
      do {
        next = (prevIndex + 1) % shuffledImages.length;
      } while (next === prevIndex && shuffledImages.length > 1);
      return next;
    });
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      let next;
      do {
        next = (prevIndex - 1 + shuffledImages.length) % shuffledImages.length;
      } while (next === prevIndex && shuffledImages.length > 1);
      return next;
    });
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
      transition: { staggerChildren: 0.12, delayChildren: 0.15 }
    }
  };

  const titleWord = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="hero-banner">
      {/* Photos only — no copy is layered over the slideshow */}
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
            >
              <img 
                src={shuffledImages[currentImageIndex]} 
                alt={`Government Bangla College campus and Physics department life — view ${currentImageIndex + 1} of ${shuffledImages.length}`} 
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                className="slide-image"
              />
              <div className="slide-overlay" aria-hidden="true"></div>
            </motion.div>
          </AnimatePresence>

          <div className="hero-fade" aria-hidden="true"></div>
          
          <div className="slide-controls">
            <div className="slide-indicators" role="tablist" aria-label="Hero slides">
              {shuffledImages.map((_, index) => (
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
          </div>
          
          <button className="nav-btn next-btn" aria-label="Next slide" onClick={goToNextImage}>
            <FaChevronRight />
          </button>
        </div>
      </motion.section>

      {/* Department copy sits below the photos, on its own solid band */}
      <section className="hero-intro" aria-labelledby="hero-title">
        <motion.div 
          className="hero-badge"
          initial={reducedMotion ? { opacity: 1 } : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
        >
          {departmentInfo.affiliation || "Excellence in Education"}
        </motion.div>

        <motion.h1 id="hero-title" variants={titleContainer} initial="hidden" animate="visible">
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
          transition={{ delay: 0.3, duration: reducedMotion ? 0 : 0.6 }}
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
          transition={{ delay: 0.4, duration: reducedMotion ? 0 : 0.6 }}
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
          transition={{ delay: 0.5, duration: reducedMotion ? 0 : 0.6 }}
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
      </section>
    </div>
  );
};

export default Hero;
