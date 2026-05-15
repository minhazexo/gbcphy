import React, { useState, useEffect, useRef } from "react";
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
  const heroRef = useRef(null);

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

  // Auto slide every 4s
  useEffect(() => {
    const imageSlider = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(imageSlider);
  }, [images.length]);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-slider">
          <button className="nav-btn prev-btn" aria-label="Previous slide" onClick={goToPrevImage}>
            <FaChevronLeft />
          </button>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className="hero-slide"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              style={{ x: parallaxX, y: parallaxY }}
            >
              <img 
                src={images[currentImageIndex]} 
                alt={`Department hero image ${currentImageIndex + 1}`} 
                loading="eager" 
                className="slide-image"
              />
              <div className="slide-overlay"></div>
            </motion.div>
          </AnimatePresence>
          
          <div className="slide-indicators">
            {images.map((_, index) => (
              <motion.div 
                key={index} 
                className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                onClick={() => setCurrentImageIndex(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
          
          <button className="nav-btn next-btn" aria-label="Next slide" onClick={goToNextImage}>
            <FaChevronRight />
          </button>

          <motion.div 
            className="hero-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div 
              className="hero-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
            >
              Excellence in Education
            </motion.div>
            
            <motion.h1 variants={titleContainer} initial="hidden" animate="visible">
              <span className="department-name">
                {departmentInfo.name.split(" ").map((word, i) => (
                  <motion.span key={i} variants={titleWord} style={{ display: "inline-block", marginRight: "0.25em" }}>
                    {word}
                  </motion.span>
                ))}
              </span>
              <motion.span 
                className="college-name"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                {departmentInfo.college}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="hero-tagline"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Excellence in Physics Education Since {departmentInfo.established}
            </motion.p>

            <motion.div 
              className="hero-cta"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.button 
                className="cta-button"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('programs').scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Programs <FaArrowRight />
              </motion.button>
              <motion.button 
                className="cta-button secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="scroll-indicator"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="mouse">
              <div className="wheel"></div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Hero;
