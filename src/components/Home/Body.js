import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaSave, FaGraduationCap, FaFlask, FaChalkboardTeacher,
  FaMapMarkerAlt, FaClock, FaUsers,
  FaArrowRight, FaExternalLinkAlt, FaQuoteLeft
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext.js";
import "./Body.scss";

const Body = ({ departmentInfo, scrolled }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [, setHoveredCard] = useState(null);
  const { theme } = useTheme();

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
    <main role="main" id="main-content">
      {/* Stats Counter Section */}
      <section id="stats" className="stats-section" aria-labelledby="stats-heading">
        <div className="container">
          <h2 id="stats-heading" className="visually-hidden" style={{display: 'none'}}>Statistics</h2>
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
              className={`about-text glass-card ${theme === 'dark' ? 'dark-mode' : ''}`}
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
                  onClick={() => navigate('/academic')}
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
                          aria-label="Edit this news"
                        >
                          <FaExternalLinkAlt /> Edit Post
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
    </main>
  );
};

export default Body;
