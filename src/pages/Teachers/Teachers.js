import React, { useState,  } from 'react';
import '../../styles/teachers.scss';
import { motion } from 'framer-motion';

const teachersData = [
  {
    name: 'Professor Taslima Ferdous',
    photo: '/images/teacher1.jpg',
    email: 'taslima.phy@gmail.com',
    phone: '01552349161',
    title: 'Professor & Head, Physics',
    batch: 'BCS 14',
    subjects: ['Quantum Mechanics', 'Advanced Physics'],
    experience: '15+ years'
  },
  {
    name: 'Kamrun Nahar',
    photo: '/images/kamrun.jpg',
    email: 'kamrunnaher231977@gmail.com',
    phone: '01819464275',
    title: 'Associate Professor, Physics',
    batch: 'BCS 22',
    subjects: ['Everything about Physics'],
    experience: '12+ years'
  },
  {
    name: 'Mohammad Shariful Arefin',
    photo: '/images/arefin.jpg',
    email: 'arefinroman@gmail.com',
    phone: '01712653188',
    title: 'Associate Professor, Physics',
    batch: 'BCS 24',
    subjects: ['Classical Mechanics', 'Mathematical Physics'],
    experience: '10+ years'
  },
  {
    name: 'Farhana Fakrun Nesha',
    photo: '/images/farhana.jpg',
    email: 'nessanfarhana@gmail.com',
    phone: '01912732402',
    title: 'Assistant Professor, Physics',
    batch: 'BCS 28',
    subjects: ['Thermal Physics', 'Statistical Mechanics'],
    experience: '8+ years'
  },
  {
    name: 'Labani Saha',
    photo: '/images/teacher5.jpg',
    email: 'labanisaha29@gmail.com',
    phone: '01788007775',
    title: 'Assistant Professor, Physics',
    batch: 'BCS 29',
    subjects: ['Solid State Physics', 'Material Science'],
    experience: '6+ years'
  },
  {
    name: 'Tahrin Haque',
    photo: '/images/tahrin.jpg',
    email: 'tahrin.loka@yahoo.com',
    phone: '01916920750',
    title: 'Assistant Professor, Physics',
    batch: 'BCS 33',
    subjects: ['Nuclear Physics', 'Particle Physics'],
    experience: '4+ years'
  },
  {
    name: 'Awlad Hossen',
    photo: '/images/teacher7.jpg',
    email: 'awlad.physics@university.edu',
    phone: '01724199348',
    title: 'Lecturer, Physics',
    batch: 'BCS 34',
    subjects: ['Computational Physics', 'Programming'],
    experience: '3+ years'
  },
  {
    name: 'Naznin Ara Parvin',
    photo: '/images/najnin.jpg',
    email: 'naju.aeceiu@gmail.com',
    phone: '01747288393',
    title: 'Lecturer, Physics',
    batch: 'BCS 34',
    subjects: ['Electromagnetism', 'Wave Theory'],
    experience: '3+ years'
  },
  {
    name: 'Shamima Sharmin',
    photo: '/images/teacher9.jpg',
    email: 'shamimasharmin732@gmail.com',
    phone: '01516063732',
    title: 'Demonstrator, Physics',
    batch: 'Recent Graduate',
    subjects: ['Lab Experiments', 'Practical Physics'],
    experience: '2+ years'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
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

const titleVariants = {
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
  const [activeCard, setActiveCard] = useState(null);

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

      <div className="page-header">
        <motion.h1 className="page-title" variants={titleVariants}>
          Meet Our Faculty
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Distinguished Professors and Researchers in Physics
        </motion.p>
      </div>

      <div className="teacher-list">
        {teachersData.map((teacher, index) => (
          <motion.div 
            className={`teacher-card ${activeCard === index ? 'active' : ''}`}
            key={index}
            variants={cardVariants}
            whileHover="hover"
            onHoverStart={() => setActiveCard(index)}
            onHoverEnd={() => setActiveCard(null)}
          >
            {/* Animated Border */}
            <div className="animated-border"></div>
            <div className="card-glow"></div>
            
            {/* Card Content */}
            <div className="card-content">
              <div className="teacher-image-container">
                <div className="image-wrapper">
                  <img 
                    src={teacher.photo} 
                    alt={teacher.name} 
                    className="teacher-image"
                    loading="lazy"
                  />
                  <div className="image-shine"></div>
                </div>
                
                {/* Experience Badge */}
                <div className="experience-badge">
                  <span>{teacher.experience}</span>
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
                  <h4>Specialized In:</h4>
                  <div className="subject-tags">
                    {teacher.subjects.map((subject, idx) => (
                      <motion.span 
                        key={idx}
                        className="subject-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + (idx * 0.1) }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {subject}
                      </motion.span>
                    ))}
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
          <span className="stat-number">{teachersData.length}</span>
          <span className="stat-label">Faculty Members</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">Years Combined Experience</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">15+</span>
          <span className="stat-label">Specializations</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Teachers;