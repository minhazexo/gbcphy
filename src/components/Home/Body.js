import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap, FaFlask, FaChalkboardTeacher,
  FaMapMarkerAlt, FaClock, FaUsers, FaArrowUp,
  FaArrowRight, FaExternalLinkAlt, FaQuoteLeft, FaChevronDown,
  FaUniversity, FaLandmark
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext.js";
import { teachersData } from "../../pages/Teachers/Teachers.js";
import "./Body.scss";

// Animated count-up value (professional stats-band pattern)
const CountUp = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v))
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

const Body = ({ departmentInfo, scrolled }) => {
  const navigate = useNavigate();
  const [, setHoveredCard] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const { theme } = useTheme();

  const handleAudienceAction = (aud) => {
    if (aud.kind === "route") navigate(aud.target);
    else document.getElementById(aud.target)?.scrollIntoView({ behavior: "smooth" });
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
          <h2 id="stats-heading" className="visually-hidden">Department at a glance</h2>
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
                <div className="stat-value">
                  <CountUp value={departmentInfo.facultyCount} suffix="+" />
                </div>
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
                <div className="stat-value">
                  <CountUp value={departmentInfo.programs.length} />
                </div>
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
                <div className="stat-value">
                  <CountUp value={departmentInfo.researchAreas.length} />
                </div>
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
                <div className="stat-value">
                  <CountUp value={new Date().getFullYear() - departmentInfo.established} suffix="+" />
                </div>
                <div className="stat-label">Years of Excellence</div>
              </div>
              <div className="stat-wave"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Audience pathways — professional dept-homepage pattern */}
      <section id="audiences" className="audiences-section" aria-labelledby="audiences-heading">
        <div className="container">
          <div className="section-header">
            <motion.div className="section-badge" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}>
              Start Here
            </motion.div>
            <motion.h2 id="audiences-heading" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              Find Your Path
            </motion.h2>
            <motion.p className="section-subhead" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Choose your journey — we’ll guide you to programs, routines, or faculty expertise.
            </motion.p>
            <motion.div className="divider" initial={{ width: 0 }} whileInView={{ width: "100px" }} viewport={{ once: true }} />
          </div>
          <motion.div className="audiences-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {(departmentInfo.audiences || []).map((aud, index) => (
              <motion.div key={index} className="audience-card" variants={itemVariants} whileHover={{ y: -8 }}>
                <h3>{aud.title}</h3>
                <p>{aud.description}</p>
                <button type="button" className="contact-button" onClick={() => handleAudienceAction(aud)}>
                  {aud.cta} <FaArrowRight aria-hidden="true" />
                </button>
              </motion.div>
            ))}
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

              <blockquote className="mission-statement">
                <span className="mission-label">Our Mission</span>
                {departmentInfo.mission}
              </blockquote>
              
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

      {/* College & University — institutional context */}
      <section id="college-university" className="college-university-section" aria-labelledby="college-university-heading">
        <div className="container">
          <div className="section-header">
            <motion.div className="section-badge" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}>
              Our Roots
            </motion.div>
            <motion.h2 id="college-university-heading" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              Government Bangla College & Dhaka Central University
            </motion.h2>
            <motion.p className="section-subhead" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Our department stands on a historic college and a new public university — Bangla-medium heritage since 1962, now united with six sister colleges under DCU (2026).
            </motion.p>
            <motion.div className="divider" initial={{ width: 0 }} whileInView={{ width: "100px" }} viewport={{ once: true }} />
          </div>

          <motion.div
            className="college-university-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.article className="cu-card" variants={itemVariants} whileHover={{ y: -8 }}>
              <div className="cu-icon" aria-hidden="true">
                <FaLandmark />
              </div>
              <p className="cu-eyebrow">Since {departmentInfo.collegeInfo?.established || "1 October 1962"} · {departmentInfo.collegeInfo?.location || "Mirpur, Dhaka"}</p>
              <h3>{departmentInfo.collegeInfo?.name || "Government Bangla College"}</h3>
              {departmentInfo.collegeInfo?.bengaliName && (
                <p className="cu-bengali">{departmentInfo.collegeInfo.bengaliName}</p>
              )}
              <p className="cu-text">{departmentInfo.collegeInfo?.origin}</p>
              {(departmentInfo.collegeInfo?.milestones || []).length > 0 && (
                <ul className="cu-facts">
                  {departmentInfo.collegeInfo.milestones.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              )}
              <div className="cu-footer">
                <span className="cu-meta">Founder: {departmentInfo.collegeInfo?.founder || "Principal Abul Kashem"}</span>
                {departmentInfo.collegeInfo?.website && (
                  <a className="contact-button" href={departmentInfo.collegeInfo.website} target="_blank" rel="noreferrer">
                    College website <FaExternalLinkAlt aria-hidden="true" />
                  </a>
                )}
              </div>
            </motion.article>

            <motion.article className="cu-card" variants={itemVariants} whileHover={{ y: -8 }}>
              <div className="cu-icon" aria-hidden="true">
                <FaUniversity />
              </div>
              <p className="cu-eyebrow">Public university · {departmentInfo.universityInfo?.established || "2026"}</p>
              <h3>{departmentInfo.universityInfo?.name || "Dhaka Central University"} {departmentInfo.universityInfo?.shortName ? `(${departmentInfo.universityInfo.shortName})` : ""}</h3>
              <p className="cu-text">{departmentInfo.universityInfo?.origin}</p>
              {(departmentInfo.universityInfo?.colleges || []).length > 0 && (
                <ul className="cu-chips" aria-label="Seven attached colleges">
                  {departmentInfo.universityInfo.colleges.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
              <div className="cu-footer">
                <span className="cu-meta">{departmentInfo.universityInfo?.scale}</span>
                {departmentInfo.universityInfo?.website && (
                  <a className="contact-button" href={departmentInfo.universityInfo.website} target="_blank" rel="noreferrer">
                    dcu.ac.bd <FaExternalLinkAlt aria-hidden="true" />
                  </a>
                )}
              </div>
            </motion.article>
          </motion.div>
        </div>
      </section>

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
                <div className="program-icon" aria-hidden="true">
                  {program.icon}
                </div>
                <h3>{program.title}</h3>
                <div className="program-duration">
                  <FaClock aria-hidden="true" /> {program.duration} · Dhaka Central University curriculum
                </div>
                <p>{program.description}</p>
                {program.outcomes && (
                  <ul className="program-outcomes">
                    {program.outcomes.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                )}
                <motion.button 
                  className="program-button"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/academic')}
                  aria-label={`${program.cta || "Learn more"} — ${program.title}`}
                >
                  {program.cta || "Learn More"} <FaArrowRight aria-hidden="true" />
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

      {/* Faculty Preview Section */}
      <section id="faculty" className="faculty-section" aria-labelledby="faculty-heading">
        <div className="container">
          <div className="section-header">
            <motion.div
              className="section-badge"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              Our People
            </motion.div>
            <motion.h2
              id="faculty-heading"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              Meet Our Faculty
            </motion.h2>
            <motion.p
              className="section-subhead"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Learn from qualified and dedicated educators guiding the next generation of physicists.
            </motion.p>
            <motion.div 
              className="divider"
              initial={{ width: 0 }}
              whileInView={{ width: "100px" }}
              viewport={{ once: true }}
            />
          </div>
          
          <motion.div 
            className="faculty-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teachersData.slice(0, 3).map((teacher, index) => (
              <motion.div 
                key={index}
                className="faculty-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                <div className="faculty-photo">
                  {teacher.photo ? (
                    <img src={teacher.photo} alt={`Portrait of ${teacher.name}, ${teacher.title}`} loading="lazy" decoding="async" />
                  ) : (
                    <span className="faculty-initials" aria-hidden="true">
                      {teacher.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </span>
                  )}
                </div>
                <h4>{teacher.name}</h4>
                <span className="faculty-title">{teacher.title}</span>
                <p className="faculty-subject">{teacher.batch || "Department of Physics"}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="section-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="program-button"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/teachers')}
            >
              View All Faculty <FaArrowRight />
            </motion.button>
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
      <section id="news" className="news-section" aria-labelledby="news-heading">
        <div className="container">
          <div className="section-header">
            <motion.div className="section-badge" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}>
              Stay Updated
            </motion.div>
            <motion.h2
              id="news-heading"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              Notices & Announcements
            </motion.h2>
            <motion.p className="section-subhead" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Admissions, examinations, and seminars — with links to the full details.
            </motion.p>
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
            {departmentInfo.notices.map((notice, index) => (
              <motion.article
                key={index}
                className="news-card"
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className="card-header">
                  <span className="notice-tag">{notice.tag}</span>
                  <span className="post-date"><time>{notice.date}</time>{notice.status ? ` · ${notice.status}` : ""}</span>
                </div>
                <div className="card-content">
                  <h3>{notice.title}</h3>
                  <p>{notice.excerpt}</p>
                  {notice.link && (
                    <button type="button" className="contact-button news-link" onClick={() => navigate(notice.link)}>
                      View details <FaArrowRight aria-hidden="true" />
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </motion.div>
          <motion.div
            className="news-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="program-button"
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/class-routine')}
            >
              View Class Routine <FaArrowRight />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* FAQ — discoverability + SEO pattern */}
      <section id="faq" className="faq-section" aria-labelledby="faq-heading">
        <div className="container">
          <div className="section-header">
            <motion.div className="section-badge" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}>
              FAQ
            </motion.div>
            <motion.h2 id="faq-heading" initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
              Frequently Asked Questions
            </motion.h2>
            <motion.div className="divider" initial={{ width: 0 }} whileInView={{ width: "100px" }} viewport={{ once: true }} />
          </div>
          <div className="faq-list">
            {(departmentInfo.faqs || []).map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className={`faq-item ${open ? "open" : ""}`}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={open}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpenFaq(open ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <FaChevronDown aria-hidden="true" className="faq-chevron" />
                  </button>
                  {open && (
                    <div id={`faq-answer-${i}`} role="region" aria-labelledby={`faq-button-${i}`} className="faq-answer">
                      <p>{f.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="cta-band" aria-labelledby="cta-heading">
        <div className="container">
          <motion.div
            className="cta-inner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="cta-heading">Study physics where theory meets hands-on labs</h2>
            <p>B.Sc. (Honours) and M.Sc. under Dhaka Central University — explore programs, routines, and faculty.</p>
            <div className="cta-actions">
              <motion.button
                className="cta-button primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/academic')}
              >
                Explore Programs <FaArrowRight />
              </motion.button>
              <motion.button
                className="cta-button ghost"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/teachers')}
              >
                Meet Our Faculty
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Section */}
      <motion.section 
        id="contact"
        className="contact-section"
        aria-labelledby="contact-heading"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="section-header">
            <motion.h2
              id="contact-heading"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              Visit & Connect
            </motion.h2>
            <motion.p className="section-subhead" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              {departmentInfo.contact?.address} — {departmentInfo.contact?.hours}
            </motion.p>
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
              <FaMapMarkerAlt className="contact-icon" aria-hidden="true" />
              <div className="contact-content">
                <h4>Department Location</h4>
                <p>{departmentInfo.contact?.address}</p>
                <a
                  className="contact-button"
                  href={departmentInfo.contact?.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Map <FaExternalLinkAlt aria-hidden="true" />
                </a>
              </div>
            </motion.div>

            <motion.div 
              className="contact-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <FaChalkboardTeacher className="contact-icon" />
              <div className="contact-content">
                <h4>Faculty & Staff</h4>
                <p>Meet our experienced teachers and researchers</p>
                <motion.button 
                  className="contact-button"
                  whileHover={{ x: 5 }}
                  onClick={() => navigate('/teachers')}
                >
                  View Directory <FaArrowRight />
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              className="contact-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <FaGraduationCap className="contact-icon" aria-hidden="true" />
              <div className="contact-content">
                <h4>Admissions</h4>
                <p>B.Sc. (Honours) and M.Sc. programs under Dhaka Central University</p>
                <motion.button 
                  className="contact-button"
                  whileHover={{ x: 5 }}
                  onClick={() => navigate('/academic')}
                >
                  Explore Programs <FaArrowRight />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Scroll to Top Button */}
      <motion.button 
        type="button"
        className="scroll-top"
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: scrolled ? 1 : 0,
          y: scrolled ? 0 : 20
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaArrowUp aria-hidden="true" />
      </motion.button>
    </main>
  );
};

export default Body;
