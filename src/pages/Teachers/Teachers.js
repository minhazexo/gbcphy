import React from 'react';
import '../../styles/teachers.scss';

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

const Teachers = () => {
  return (
    <div className="teachers-page">
      <h2 className="page-title">Meet Our Teachers</h2>
      <div className="teacher-list">
        {teachersData.map((teacher, index) => (
          <div className="teacher-card" key={index}>
            <img src={teacher.photo} alt={teacher.name} />
            <h3>{index + 1}. {teacher.name}</h3>
            <p><strong>Title:</strong> {teacher.title}</p>
            {teacher.batch && <p><strong>BCS Batch:</strong> {teacher.batch}</p>}
            <p><strong>Email:</strong> <a href={`mailto:${teacher.email}`}>{teacher.email || 'N/A'}</a></p>
            <p><strong>Phone:</strong> <a href={`tel:${teacher.phone}`}>{teacher.phone}</a></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;