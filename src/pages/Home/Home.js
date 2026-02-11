import React, { useState, useEffect, useRef } from "react";
import "../../styles/home.scss";
import axios from "axios";
import { 
  FaSave, 
  FaChevronLeft, FaChevronRight,  
  FaGraduationCap, FaFlask, FaChalkboardTeacher,
  FaMapMarkerAlt, FaClock, FaUsers,
  FaArrowRight, FaExternalLinkAlt, FaQuoteLeft
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const images = [
    "/images/5.jpg",
    "/images/6.jpg", 
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg",
    "/images/10.jpg"
  ];

  const departmentInfo = {
    name: "Department of Physics",
    college: "Government Bangla College",
    established: 2010,
    facultyCount: 9,
    programs: [
      {
        title: "B.Sc. (Honors) in Physics",
        duration: "4 Years",
        description: "Undergraduate program following National University curriculum",
        icon: <FaGraduationCap />
      },
      {
        title: "M.Sc. in Physics",
        duration: "1 Year", 
        description: "Postgraduate program with research components",
        icon: <FaFlask />
      }
    ],
    researchAreas: [
      {
        title: "Condensed Matter Physics",
        description: "Study of matter in condensed phases"
      },
      {
        title: "Nuclear Physics",
        description: "Research on atomic nuclei and particles"
      },
      {
        title: "Electronics",
        description: "Circuit design and electronic systems"
      },
      {
        title: "Theoretical Physics",
        description: "Mathematical models of physical systems"
      },
      {
        title: "Experimental Physics",
        description: "Laboratory-based research"
      }
    ],
    facilities: [
      {
        title: "Advanced Physics Laboratory",
        description: "State-of-the-art equipment for experiments"
      },
      {
        title: "Electronics Lab", 
        description: "Modern electronics testing equipment"
      },
      {
        title: "Computer Lab",
        description: "High-performance computing facilities"
      },
      {
        title: "Research Equipment",
        description: "Specialized instruments for research"
      }
    ],
    testimonials: [
      {
        text: "The department provided excellent research facilities and guidance for my postgraduate studies.",
        author: "Dr. Mohammad Ali",
        position: "Research Scientist"
      },
      {
        text: "The curriculum is well-structured and prepares students for both academia and industry.",
        author: "Sarah Khan",
        position: "Former Student, M.Sc."
      }
    ]
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredCard, setHoveredCard] = useState(null);
  const heroRef = useRef(null);
  const statsRef = useRef([]);

  // Auto slide every 4s
  useEffect(() => {
    const imageSlider = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(imageSlider);
  }, [images.length]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll("section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Fetch posts safely
  useEffect(() => {
    axios.get("http://localhost:5010/api/posts")
      .then(res => {
        setPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Error fetching posts", err);
        setPosts([]);
      });
  }, []);

  const handleSaveClick = (index) => {
    const updatedPosts = [...posts];
    updatedPosts[index].content = editText;
    setPosts(updatedPosts);
    setEditingIndex(null);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditText(posts[index]?.content || "");
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="home-container" data-scroll-container>
      <div className="home-content">
        {/* Floating Particles Background */}
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Hero Section with Parallax */}
        <motion.section 
          id="hero"
          className={`hero-section ${scrolled ? 'scrolled' : ''}`}
          ref={heroRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="hero-parallax">
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`parallax-layer ${index === currentImageIndex ? "active" : ""}`}
                style={{
                  backgroundImage: `url(${image})`,
                  transform: `translateX(${mousePosition.x * 0.5}px) translateY(${mousePosition.y * 0.5}px)`
                }}
              />
            ))}
          </div>

          <div className="hero-slider">
            <button className="nav-btn prev-btn" onClick={goToPrevImage}>
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
                style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
              >
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
            
            <button className="nav-btn next-btn" onClick={goToNextImage}>
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                Excellence in Education
              </motion.div>
              
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <span className="department-name">{departmentInfo.name}</span>
                <motion.span 
                  className="college-name"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 1 }}
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
                >
                  Explore Programs <FaArrowRight />
                </motion.button>
                <motion.button 
                  className="cta-button secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Us
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
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

        {/* Stats Counter Section */}
        <section id="stats" className="stats-section">
          <div className="container">
            <motion.div 
              className="stats-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="stat-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                onMouseEnter={() => setHoveredCard("faculty")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="stat-icon">
                  <FaUsers />
                </div>
                <div className="stat-content">
                  <motion.div 
                    className="stat-value"
                    initial={{ number: 0 }}
                    whileInView={{ number: departmentInfo.facultyCount }}
                    viewport={{ once: true }}
                  >
                    {departmentInfo.facultyCount}+
                  </motion.div>
                  <div className="stat-label">Expert Faculty</div>
                </div>
                <div className="stat-wave"></div>
              </motion.div>

              <motion.div 
                className="stat-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="stat-icon">
                  <FaGraduationCap />
                </div>
                <div className="stat-content">
                  <motion.div 
                    className="stat-value"
                    initial={{ number: 0 }}
                    whileInView={{ number: departmentInfo.programs.length }}
                    viewport={{ once: true }}
                  >
                    {departmentInfo.programs.length}
                  </motion.div>
                  <div className="stat-label">Programs</div>
                </div>
                <div className="stat-wave"></div>
              </motion.div>

              <motion.div 
                className="stat-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="stat-icon">
                  <FaFlask />
                </div>
                <div className="stat-content">
                  <motion.div 
                    className="stat-value"
                    initial={{ number: 0 }}
                    whileInView={{ number: departmentInfo.researchAreas.length }}
                    viewport={{ once: true }}
                  >
                    {departmentInfo.researchAreas.length}
                  </motion.div>
                  <div className="stat-label">Research Areas</div>
                </div>
                <div className="stat-wave"></div>
              </motion.div>

              <motion.div 
                className="stat-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="stat-icon">
                  <FaClock />
                </div>
                <div className="stat-content">
                  <motion.div 
                    className="stat-value"
                    initial={{ number: 0 }}
                    whileInView={{ number: new Date().getFullYear() - departmentInfo.established }}
                    viewport={{ once: true }}
                  >
                    {new Date().getFullYear() - departmentInfo.established}+
                  </motion.div>
                  <div className="stat-label">Years of Excellence</div>
                </div>
                <div className="stat-wave"></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Section with Glass Morphism */}
        <motion.section 
          id="about"
          className="about-section"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container">
            <div className="section-header">
              <motion.div 
                className="section-badge"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
              >
                About Us
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                Welcome to Our Department
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              />
            </div>

            <div className="about-content">
              <motion.div 
                className="about-text glass-card"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <p>
                  The Department of Physics at Government Bangla College is dedicated to 
                  providing quality education in physics through comprehensive academic 
                  programs, practical laboratory work, and research opportunities. Our 
                  mission is to nurture scientific thinking and prepare students for 
                  successful careers in academia, research, and industry.
                </p>
                
                <motion.div 
                  className="features-grid"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    { icon: <FaUsers />, title: "Experienced Faculty", desc: "Learn from qualified and dedicated professors" },
                    { icon: <FaFlask />, title: "Modern Laboratories", desc: "Hands-on experience with advanced equipment" },
                    { icon: <FaGraduationCap />, title: "Research Opportunities", desc: "Engage in meaningful scientific research" }
                  ].map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="feature-item"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="feature-icon-wrapper">
                        {feature.icon}
                      </div>
                      <h4>{feature.title}</h4>
                      <p>{feature.desc}</p>
                      <div className="feature-line"></div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Programs Section */}
        <section id="programs" className="programs-section">
          <div className="container">
            <div className="section-header">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                Academic Programs
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="programs-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {departmentInfo.programs.map((program, index) => (
                <motion.div 
                  key={index}
                  className="program-card"
                  variants={itemVariants}
                  whileHover={{ y: -15, transition: { duration: 0.3 } }}
                  onMouseEnter={() => setHoveredCard(`program-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-glow"></div>
                  <div className="program-icon">
                    {program.icon}
                  </div>
                  <h3>{program.title}</h3>
                  <div className="program-duration">
                    <FaClock /> {program.duration}
                  </div>
                  <p>{program.description}</p>
                  <motion.button 
                    className="program-button"
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More <FaArrowRight />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Research Areas Section */}
        <section id="research" className="research-section">
          <div className="container">
            <div className="section-header">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                Research & Specializations
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="research-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {departmentInfo.researchAreas.map((area, index) => (
                <motion.div 
                  key={index}
                  className="research-card"
                  variants={itemVariants}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                  }}
                >
                  <div className="research-icon">
                    <FaFlask />
                  </div>
                  <h4>{area.title}</h4>
                  <p>{area.description}</p>
                  <div className="research-line"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Facilities Section */}
        <section id="facilities" className="facilities-section">
          <div className="container">
            <div className="section-header">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                Our Facilities
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="facilities-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {departmentInfo.facilities.map((facility, index) => (
                <motion.div 
                  key={index}
                  className="facility-card"
                  variants={itemVariants}
                  whileHover={{ 
                    y: -10,
                    rotateX: 5,
                    rotateY: 5 
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="facility-number">0{index + 1}</div>
                  <h4>{facility.title}</h4>
                  <p>{facility.description}</p>
                  <motion.div 
                    className="facility-hover"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials-section">
          <div className="container">
            <div className="section-header">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                What Our Students Say
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="testimonials-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {departmentInfo.testimonials.map((testimonial, index) => (
                <motion.div 
                  key={index}
                  className="testimonial-card"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <FaQuoteLeft className="quote-icon" />
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-author">
                    <h4>{testimonial.author}</h4>
                    <span>{testimonial.position}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* News & Announcements Section */}
        <section id="news" className="news-section">
          <div className="container">
            <div className="section-header">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                Department News & Announcements
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="news-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div 
                    key={post._id || index}
                    className="news-card"
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                  >
                    <div className="card-header">
                      <h3>{post.title}</h3>
                      <motion.span 
                        className="post-date"
                        whileHover={{ scale: 1.1 }}
                      >
                        {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                      </motion.span>
                    </div>
                    
                    <div className="card-content">
                      {editingIndex === index ? (
                        <div className="edit-container">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows="4"
                          />
                          <div className="edit-actions">
                            <motion.button 
                              className="save-btn"
                              onClick={() => handleSaveClick(index)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaSave /> Save
                            </motion.button>
                            <motion.button 
                              className="cancel-btn"
                              onClick={() => setEditingIndex(null)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p>{post.content}</p>
                          <motion.button 
                            className="edit-btn"
                            onClick={() => handleEditClick(index)}
                            whileHover={{ x: 5 }}
                          >
                            Edit
                          </motion.button>
                        </>
                      )}
                    </div>
                    <div className="card-wave"></div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  className="no-news"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p>No announcements at the moment. Check back later for updates.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Contact Info Section */}
        <motion.section 
          id="contact"
          className="contact-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="container">
            <div className="section-header">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                Contact Information
              </motion.h2>
              <motion.div 
                className="divider"
                initial={{ width: 0 }}
                whileInView={{ width: "100px" }}
                viewport={{ once: true }}
              />
            </div>
            
            <motion.div 
              className="contact-grid"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div 
                className="contact-card"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <FaMapMarkerAlt className="contact-icon" />
                <div className="contact-content">
                  <h4>Department Location</h4>
                  <p>Science Building, Government Bangla College</p>
                  <motion.button 
                    className="contact-button"
                    whileHover={{ x: 5 }}
                  >
                    View on Map <FaExternalLinkAlt />
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                className="contact-card"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <FaChalkboardTeacher className="contact-icon" />
                <div className="contact-content">
                  <h4>Department Head</h4>
                  <p>Professor Taslima Ferdous</p>
                  <motion.button 
                    className="contact-button"
                    whileHover={{ x: 5 }}
                  >
                    Send Email <FaExternalLinkAlt />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Scroll to Top Button */}
        <motion.button 
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: scrolled ? 1 : 0,
            y: scrolled ? 0 : 20
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ↑
        </motion.button>
      </div>
    </div>
  );
};

export default Home;