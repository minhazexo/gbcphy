import React from 'react';
import '../../styles/teachers.scss';
import { motion } from 'framer-motion';

const teachersData = [
  {
    name: 'Professor Taslima Ferdous',
    photo: '/images/teacher1.jpg',
    email: 'taslima.phy@gmail.com',
    phone: '01552349161',
    title: 'Professor & Head, Physics',
    batch: 'BCS 14'
  },
  {
    name: 'Kamrun Nahar',
    photo: '/images/kamrun.jpg',
    email: 'kamrunnaher231977@gmail.com',
    phone: '01819464275',
    title: 'Associate Professor, Physics',
    batch: 'BCS 22'
  },
  {
    name: 'Mohammad Shariful Arefin',
    photo: '/images/arefin.jpg',
    email: 'arefinroman@gmail.com',
    phone: '01712653188',
    title: 'Associate Professor, Physics',
    batch: 'BCS 24'
  },
  {
    name: 'Farhana Fakrun Nesha',
    photo: '/images/farhana.jpg',
    email: 'nessanfarhana@gmail.com',
    phone: '01912732402',
    title: 'Assistant Professor, Physics',
    batch: 'BCS 28'
  },
  {
    name: 'Labani Saha',
    photo: '/images/teacher5.jpg',
    email: 'labanisaha29@gmail.com',
    phone: '01788007775',
    title: 'Assistant Professor, Physics',
    batch: 'BCS 29'
  },
  {
    name: 'Tahrin Haque',
    photo: '/images/tahrin.jpg',
    email: 'tahrin.loka@yahoo.com',
    phone: '01916920750',
    title: 'Assistant Professor, Physics',
    batch: 'BCS 33'
  },
  {
    name: 'Awlad Hossen',
    photo: '/images/teacher7.jpg',
    email: '',
    phone: '01724199348',
    title: 'Lecturer, Physics',
    batch: 'BCS 34'
  },
  {
    name: 'Naznin Ara Parvin',
    photo: '/images/najnin.jpg',
    email: 'naju.aeceiu@gmail.com',
    phone: '01747288393',
    title: 'Lecturer, Physics',
    batch: 'BCS 34'
  },
  {
    name: 'Shamima Sharmin',
    photo: '/images/teacher9.jpg',
    email: 'shamimasharmin732@gmail.com',
    phone: '01516063732',
    title: 'Demonstrator, Physics',
    batch: ''
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -10,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)"
  }
};

const titleVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "backOut"
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
      <motion.h2 className="page-title" variants={titleVariants}>
        Meet Our Teachers
      </motion.h2>
      
      <div className="teacher-list">
        {teachersData.map((teacher, index) => (
          <motion.div 
            className="teacher-card" 
            key={index}
            variants={cardVariants}
            whileHover="hover"
          >
            <div className="teacher-image-container">
              <img 
                src={teacher.photo} 
                alt={teacher.name} 
                className="teacher-image"
                loading="lazy"
              />
              <div className="teacher-overlay">
                <div className="social-links">
                  {teacher.email && (
                    <a href={`mailto:${teacher.email}`} aria-label="Email">
                      <i className="fas fa-envelope"></i>
                    </a>
                  )}
                  <a href={`tel:${teacher.phone}`} aria-label="Phone">
                    <i className="fas fa-phone"></i>
                  </a>
                </div>
              </div>
            </div>
            <h3>{index + 1}. {teacher.name}</h3>
            <p className="teacher-title">{teacher.title}</p>
            {teacher.batch && <p className="teacher-batch"><span>BCS Batch:</span> {teacher.batch}</p>}
            <div className="teacher-contact">
              {teacher.email && (
                <p>
                  <i className="fas fa-envelope"></i> 
                  <a href={`mailto:${teacher.email}`}>{teacher.email}</a>
                </p>
              )}
              <p>
                <i className="fas fa-phone"></i> 
                <a href={`tel:${teacher.phone}`}>{teacher.phone}</a>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Teachers;