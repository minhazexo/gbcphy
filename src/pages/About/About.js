import React from "react";
import "../../styles/about.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook } from "@fortawesome/free-brands-svg-icons"; // Import Facebook icon

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1>About the Department of Physics</h1>
        <p className="intro-text">
          Welcome to the Department of Physics. Our mission is to provide
          high-quality education and research in the field of physics.
        </p>
        <div className="vision-section">
          <h2>Our Vision</h2>
          <p>
            To be a leading department that excels in teaching, research, and
            community engagement.
          </p>
        </div>
        <div className="contact-section">
          <h2>Contact Admin</h2>
          <p>
            <strong>Email:</strong> minhazojy@gmail.com
            <br />
            <a
              href="https://www.facebook.com/minhazexo"
              target="_blank"
              rel="noopener noreferrer"
              className="facebook-link"
            >
              <FontAwesomeIcon icon={faFacebook} /> Visit my Facebook profile
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
