import React from "react";
import "./footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} Dept of Physics. All rights
          reserved.
        </p>
        <p>
          <a href="https://minhazexo.github.io/portfolio/" className="footer-link" target="_blank" rel="noopener noreferrer">
            About Us
          </a>{" "}
          |
          <a href="https://minhazexo.github.io/portfolio/" className="footer-link" target="_blank" rel="noopener noreferrer">
            {" "}
            Contact Us
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
