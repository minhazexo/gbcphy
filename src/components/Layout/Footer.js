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
          <a href="/about" className="footer-link">
            About Us
          </a>{" "}
          |
          <a href="/contact" className="footer-link">
            {" "}
            Contact Us
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
