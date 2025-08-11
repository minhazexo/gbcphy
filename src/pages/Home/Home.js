import React, { useState, useEffect } from "react";
import "../../styles/home.scss";
import axios from "axios";
import { FaUser, FaLock, FaSignOutAlt, FaEdit, FaSave, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Home = () => {
  const images = [
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg",
    "/images/10.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [admin, setAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [posts, setPosts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);

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

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      setAdmin(true);
      setShowLoginForm(false);
    } else {
      alert("Invalid credentials!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    setAdmin(false);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditText(posts[index].content);
  };

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
        <div className="header-section">
          <h1>
            <span>Department of</span>
            <span>Physics</span>
          </h1>
          <div className="accent-bar"></div>
          <p className="subheading">Government Bangla College</p>
        </div>
        
        <div className="content-grid">
          <div className="intro-section">
            <h2>About Our Department</h2>
            <p>
              The Department of Physics at Government Bangla College is committed to fostering a deep understanding of the fundamental laws that govern the universe. With a strong emphasis on both theoretical and experimental physics, we offer comprehensive undergraduate and graduate programs designed to equip students with the knowledge, skills, and curiosity necessary to excel in academia, research, and industry.
            </p>
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">9+</div>
                <div className="stat-label">Faculty Members</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">2</div>
                <div className="stat-label">Research Labs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">400+</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
          </div>
          
          <div className="slider-section">
            <div className="photo-slider">
              <button className="nav-btn prev-btn" onClick={goToPrevImage}>
                <FaChevronLeft />
              </button>
              {images.map((image, index) => (
                <div 
                  key={index} 
                  className={`slide-image ${index === currentImageIndex ? "active" : ""}`}
                  style={{ backgroundImage: `url(${image})` }}
                />
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
            </div>
          </div>
        </div>

        <div className="admin-section">
          {admin ? (
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout Admin
            </button>
          ) : (
            <button 
              className="login-toggle-btn"
              onClick={() => setShowLoginForm(!showLoginForm)}
            >
              <FaUser /> Admin Login
            </button>
          )}
          
          {!admin && showLoginForm && (
            <form className="admin-login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button type="submit">Login</button>
            </form>
          )}
        </div>

        <div className="news-section">
          <div className="section-header">
            <h2>Latest News & Announcements</h2>
            <div className="divider"></div>
          </div>
          <div className="news-grid">
            {posts.map((post, index) => (
              <div key={post._id} className="news-card">
                <div className="card-header">
                  <h3>{post.title}</h3>
                  <span className="post-date">{new Date().toLocaleDateString()}</span>
                </div>
                
                {editingIndex === index ? (
                  <div className="edit-container">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button 
                      className="save-btn"
                      onClick={() => handleSaveClick(index)}
                    >
                      <FaSave /> Save
                    </button>
                  </div>
                ) : (
                  <div className="card-content">
                    <p>{post.content}</p>
                    {admin && (
                      <button 
                        className="edit-btn"
                        onClick={() => handleEditClick(index)}
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;