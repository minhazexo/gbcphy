import React, { useState, useEffect } from "react";
import "../../styles/home.scss";
import axios from "axios";
import { 
   FaSave, 
  FaChevronLeft, FaChevronRight,  
  FaGraduationCap, FaFlask, FaChalkboardTeacher,
  FaMapMarkerAlt, FaClock, FaUsers
} from "react-icons/fa";

const Home = () => {
  const images = [
    "/images/5.jpg",
    "/images/6.jpg", 
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg",
    "/images/10.jpg"
  ];

  // Real department data
  const departmentInfo = {
    name: "Department of Physics",
    college: "Government Bangla College",
    established: 2010, // Replace with actual year
    facultyCount: 9, // From your teachers data
    programs: [
      {
        title: "B.Sc. (Honors) in Physics",
        duration: "4 Years",
        description: "Undergraduate program following National University curriculum"
      },
      {
        title: "M.Sc. in Physics",
        duration: "1 Year", 
        description: "Postgraduate program with research components"
      }
    ],
    researchAreas: [
      "Condensed Matter Physics",
      "Nuclear Physics",
      "Electronics",
      "Theoretical Physics",
      "Experimental Physics"
    ],
    facilities: [
      "Advanced Physics Laboratory",
      "Electronics Lab", 
      "Computer Lab",
      "Research Equipment"
    ]
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [posts, setPosts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  

  // Auto slide every 4s
  useEffect(() => {
    const imageSlider = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(imageSlider);
  }, [images.length]);

  // Fetch posts
  useEffect(() => {
    axios.get("http://localhost:5000/api/posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Error fetching posts", err));
  }, []);

  

  

  

  const handleSaveClick = (index) => {
    const updatedPosts = [...posts];
    updatedPosts[index].content = editText;
    setPosts(updatedPosts);
    setEditingIndex(null);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="home-container">
      

      

      <div className="home-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-slider">
            <button className="nav-btn prev-btn" onClick={goToPrevImage}>
              <FaChevronLeft />
            </button>
            
            {images.map((image, index) => (
              <div 
                key={index} 
                className={`hero-slide ${index === currentImageIndex ? "active" : ""}`}
                style={{ backgroundImage: `url(${image})` }}
              >
                <div className="slide-overlay"></div>
              </div>
            ))}
            
            <div className="slide-indicators">
              {images.map((_, index) => (
                <div 
                  key={index} 
                  className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
            
            <button className="nav-btn next-btn" onClick={goToNextImage}>
              <FaChevronRight />
            </button>

            <div className="hero-content">
              <h1>
                <span className="department-name">{departmentInfo.name}</span>
                <span className="college-name">{departmentInfo.college}</span>
              </h1>
              <p className="hero-tagline">
                Excellence in Physics Education Since {departmentInfo.established}
              </p>
            </div>
          </div>
        </section>

        

        {/* About Section */}
        <section className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <h2>Welcome to Our Department</h2>
                <p>
                  The Department of Physics at Government Bangla College is dedicated to 
                  providing quality education in physics through comprehensive academic 
                  programs, practical laboratory work, and research opportunities. Our 
                  mission is to nurture scientific thinking and prepare students for 
                  successful careers in academia, research, and industry.
                </p>
                
                <div className="features-grid">
                  <div className="feature-item">
                    <FaUsers className="feature-icon" />
                    <h4>Experienced Faculty</h4>
                    <p>Learn from qualified and dedicated professors</p>
                  </div>
                  <div className="feature-item">
                    <FaFlask className="feature-icon" />
                    <h4>Modern Laboratories</h4>
                    <p>Hands-on experience with advanced equipment</p>
                  </div>
                  <div className="feature-item">
                    <FaGraduationCap className="feature-icon" />
                    <h4>Research Opportunities</h4>
                    <p>Engage in meaningful scientific research</p>
                  </div>
                </div>
              </div>
              
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-value">{departmentInfo.facultyCount}</div>
                  <div className="stat-label">Faculty Members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{departmentInfo.programs.length}</div>
                  <div className="stat-label">Academic Programs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{departmentInfo.researchAreas.length}</div>
                  <div className="stat-label">Research Areas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{new Date().getFullYear() - departmentInfo.established}+</div>
                  <div className="stat-label">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="programs-section">
          <div className="container">
            <h2>Academic Programs</h2>
            <div className="programs-grid">
              {departmentInfo.programs.map((program, index) => (
                <div key={index} className="program-card">
                  <div className="program-icon">
                    <FaGraduationCap />
                  </div>
                  <h3>{program.title}</h3>
                  <div className="program-duration">
                    <FaClock /> {program.duration}
                  </div>
                  <p>{program.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Research Areas */}
        <section className="research-section">
          <div className="container">
            <h2>Research & Specializations</h2>
            <div className="research-areas">
              {departmentInfo.researchAreas.map((area, index) => (
                <div key={index} className="research-area">
                  <FaFlask className="research-icon" />
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="facilities-section">
          <div className="container">
            <h2>Our Facilities</h2>
            <div className="facilities-grid">
              {departmentInfo.facilities.map((facility, index) => (
                <div key={index} className="facility-card">
                  <h4>{facility}</h4>
                  <p>Well-equipped space for practical learning and research</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* News & Announcements Section */}
        <section className="news-section">
          <div className="container">
            <div className="section-header">
              <h2>Department News & Announcements</h2>
              <div className="divider"></div>
            </div>
            <div className="news-grid">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <div key={post._id} className="news-card">
                    <div className="card-header">
                      <h3>{post.title}</h3>
                      <span className="post-date">
                        {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {editingIndex === index ? (
                      <div className="edit-container">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows="4"
                        />
                        <div className="edit-actions">
                          <button 
                            className="save-btn"
                            onClick={() => handleSaveClick(index)}
                          >
                            <FaSave /> Save
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={() => setEditingIndex(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card-content">
                        <p>{post.content}</p>
                        
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-news">
                  <p>No announcements at the moment. Check back later for updates.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="contact-section">
          <div className="container">
            <h2>Contact Information</h2>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <div>
                  <h4>Department Location</h4>
                  <p>Science Building, Government Bangla College</p>
                </div>
              </div>
              <div className="contact-item">
                <FaChalkboardTeacher className="contact-icon" />
                <div>
                  <h4>Department Head</h4>
                  <p>Professor Taslima Ferdous</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;