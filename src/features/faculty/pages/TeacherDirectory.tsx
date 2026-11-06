// TeacherDirectory page — renders the canonical FACULTY roster.
// Class names here must match ./teachers.scss exactly.

import './teachers.scss';
import { motion } from 'framer-motion';
import { FACULTY, facultyCount } from '../../../data/teachers.ts';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariants: any = {
  hidden: {
    y: 40,
    opacity: 0,
    scale: 0.9
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -15,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const titleVariants: any = {
  hidden: {
    y: -30,
    opacity: 0,
    scale: 0.95
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1]
    }
  }
};

const Teachers = () => {
  return (
    <motion.div
      className="teachers-page"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Animated Background Elements */}
      <div className="floating-elements">
        <div className="floating-element el-1"></div>
        <div className="floating-element el-2"></div>
        <div className="floating-element el-3"></div>
        <div className="floating-element el-4"></div>
      </div>

      <div className="teachers-page-header">
        <motion.h1 className="teachers-page-title" variants={titleVariants}>
          Meet Our Faculty
        </motion.h1>
        <motion.p
          className="teachers-page-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Distinguished Professors and Researchers in Physics
        </motion.p>
      </div>

      <div className="teacher-list">
        {FACULTY.map((teacher, index) => (
          <motion.div
            className="teacher-card"
            key={index}
            variants={cardVariants}
            whileHover="hover"
          >
            {/* Animated Border */}
            <div className="animated-border"></div>
            <div className="card-glow"></div>

            {/* Card Content */}
            <div className="card-content">
              <div className="teacher-image-container">
                <div className="image-wrapper">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.name}
                      className="teacher-image"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.add('show');
                      }}
                    />
                  ) : null}
                  <div className={`image-fallback ${teacher.photo ? '' : 'show'}`} aria-hidden="true">
                    {teacher.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="image-shine"></div>
                </div>

                {/* Social Links */}
                <div className="teacher-overlay">
                  <div className="social-links">
                    {teacher.email && (
                      <motion.a
                        href={`mailto:${teacher.email}`}
                        aria-label="Email"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <i className="fas fa-envelope"></i>
                      </motion.a>
                    )}
                    <motion.a
                      href={`tel:${teacher.phone}`}
                      aria-label="Phone"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <i className="fas fa-phone"></i>
                    </motion.a>
                  </div>
                </div>
              </div>

              <div className="teacher-info">
                <div className="teacher-header">
                  <h3 className="teacher-name">
                    <span className="serial">{String(index + 1).padStart(2, '0')}</span>
                    {teacher.name}
                  </h3>
                  {teacher.nameBn && (
                    <p className="teacher-name-bn">{teacher.nameBn}</p>
                  )}
                  <motion.div
                    className="title-badge"
                    whileHover={{ scale: 1.05 }}
                  >
                    {teacher.title}
                  </motion.div>
                </div>

                {teacher.batch && (
                  <div className="batch-info">
                    <i className="fas fa-graduation-cap"></i>
                    <span>BCS Batch: {teacher.batch}</span>
                  </div>
                )}

                <div className="subjects-taught">
                  <h4>Department</h4>
                  <div className="subject-tags">
                    <motion.span
                      className="subject-tag"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {teacher.department || 'Physics'}
                    </motion.span>
                    {teacher.designationBn && (
                      <motion.span
                        className="subject-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {teacher.designationBn}
                      </motion.span>
                    )}
                  </div>
                </div>

                <div className="teacher-contact">
                  {teacher.email && (
                    <motion.div
                      className="contact-item"
                      whileHover={{ x: 5 }}
                    >
                      <i className="fas fa-envelope"></i>
                      <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
                    </motion.div>
                  )}
                  <motion.div
                    className="contact-item"
                    whileHover={{ x: 5 }}
                  >
                    <i className="fas fa-phone"></i>
                    <a href={`tel:${teacher.phone}`}>{teacher.phone}</a>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footer */}
      <motion.div
        className="stats-footer"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="stat-item">
          <span className="stat-number">{facultyCount}</span>
          <span className="stat-label">Faculty Members</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">1 + 2 + 4</span>
          <span className="stat-label">Professor / Associate / Assistant</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">1</span>
          <span className="stat-label">Demonstrator</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Teachers;
