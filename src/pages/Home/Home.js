import React, { useState, useEffect } from "react";
import "../../styles/home.scss";

const Home = () => {
  const images = ["/images/5.jpg", "/images/6.jpg", "/images/7.jpg", "/images/8.jpg", "/images/9.jpg", "/images/10.jpg"];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imageSlider = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(imageSlider);
  }, [images.length]);

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to the Department of Physics</h1>
        <p className="intro-text">
          The Department of Physics at XYZ University is dedicated to advancing
          the understanding of the fundamental principles that govern the
          universe. We offer a range of undergraduate and graduate programs
          tailored to the needs of our students.
        </p>

        {/* Enhanced 3D Photo Slider */}
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

        <div className="news-section">
          <h2>Latest News</h2>
          <ul className="news-list">
            <li>New research grants awarded to faculty members.</li>
            <li>Upcoming seminars and guest lectures.</li>
            <li>Student research showcase scheduled for next month.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
