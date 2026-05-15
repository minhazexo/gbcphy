import { Link } from "react-router-dom";
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
          <Link to="/about" className="footer-link">
            About Us
          </Link>{" "}
          |
          <Link to="/#contact" className="footer-link">
            {" "}
            Contact Us
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
