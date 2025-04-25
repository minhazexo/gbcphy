import React, { useState, useEffect } from "react";
import "../../styles/home.scss";
import axios from "axios";

const Home = () => {
  const images = ["/images/5.jpg", "/images/6.jpg", "/images/7.jpg", "/images/8.jpg", "/images/9.jpg", "/images/10.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [admin, setAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [posts, setPosts] = useState([]); // State to store posts
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const imageSlider = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);
    return () => clearInterval(imageSlider);
  }, [images.length]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/posts')
      .then(res => {
        setPosts(res.data);
      })
      .catch(err => {
        console.error('Error fetching posts', err);
      });
  }, []);
  

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("isAdmin", "true");
      setAdmin(true);
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

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Department of Physics</h1>
        <p className="intro-text">
        The Department of Physics at Government Bangla College is committed to fostering a deep understanding of the fundamental laws that govern the universe. With a strong emphasis on both theoretical and experimental physics, we offer comprehensive undergraduate and graduate programs designed to equip students with the knowledge, skills, and curiosity necessary to excel in academia, research, and industry. Our dedicated faculty, state-of-the-art laboratories, and collaborative learning environment make the Department of Physics a vibrant hub of scientific discovery and innovation.


        </p>

        {/* 3D Photo Slider */}
        <div className="photo-slider">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Physics Department ${index + 1}`}
              className={`slide-image ${index === currentImageIndex ? "active" : ""}`}
            />
          ))}
        </div>

        {/* Admin Login */}
        {!admin ? (
          <form className="admin-login-form" onSubmit={handleLogin}>
            <h3>Admin Login</h3>
            <input
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <button className="logout-btn" onClick={handleLogout}>Logout Admin</button>
        )}

        {/* Latest News */}
        <div className="news-section">
          <h2>Latest News</h2>
          <ul className="news-list">
            {posts.map((post, index) => (
              <li key={post._id}>
                {editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button onClick={() => handleSaveClick(index)}>Save</button>
                  </>
                ) : (
                  <>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    {admin && <button onClick={() => handleEditClick(index)}>Edit</button>}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
