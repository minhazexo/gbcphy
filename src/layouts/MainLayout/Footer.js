// Footer for the public website.

import { Link } from "react-router-dom";
import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="main-footer__content">
        <p>
          &copy; {new Date().getFullYear()} Dept of Physics. All rights reserved.
        </p>
        <p>
          <Link to="/about" className="main-footer__link">
            About Us
          </Link>{" "}
          |
          <Link to="/#contact" className="main-footer__link">
            Contact Us
          </Link>
        </p>
      </div>
    </footer>
  );
}
