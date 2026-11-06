// Footer for the public website — modern, multi-column design system.

import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import "./Footer.scss";

const FOOTER_LINKS: Array<{ label: string; to: string }> = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Teachers", to: "/teachers" },
  { label: "Academic", to: "/academic" },
  { label: "Class Routine", to: "/class-routine" },
];

const SOCIAL_LINKS: Array<{ label: string; icon: React.ComponentType; href: string }> = [
  { label: "Facebook", icon: FaFacebook, href: "https://facebook.com" },
  { label: "Twitter", icon: FaTwitter, href: "https://twitter.com" },
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
  { label: "YouTube", icon: FaYoutube, href: "https://youtube.com" },
];

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="main-footer__top">
        <div className="main-footer__brand">
          <div className="main-footer__logo">
            <img alt="Dept Of Physics Logo" className="logo" loading="eager" src="/images/gbclogo.png" />
          </div>
          <div className="main-footer__brand-info">
            <h3 className="main-footer__brand-name">Dept. of Physics</h3>
            <p className="main-footer__brand-tagline">
              Government Bangla College &bull; Dhaka Central University
            </p>
          </div>
          <div className="main-footer__social">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="main-footer__social-link" aria-label={s.label}>
                <s.icon />
              </a>
            ))}
          </div>
        </div>

        <nav className="main-footer__nav">
          <h4 className="main-footer__nav-title">Quick Links</h4>
          <ul className="main-footer__nav-list">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label} className="main-footer__nav-item">
                <Link to={link.to} className="main-footer__nav-link">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="main-footer__contact">
          <h4 className="main-footer__contact-title">Contact Us</h4>
          <ul className="main-footer__contact-list">
            <li className="main-footer__contact-item">
              <span className="main-footer__contact-icon">
                <FaMapMarkerAlt />
              </span>
              <span>Mirpur, Dhaka, Bangladesh</span>
            </li>
            <li className="main-footer__contact-item">
              <span className="main-footer__contact-icon">
                <FaPhone />
              </span>
              <span>+880 2-XXX-XXXX</span>
            </li>
            <li className="main-footer__contact-item">
              <span className="main-footer__contact-icon">
                <FaEnvelope />
              </span>
              <span>physics@gbcl.edu.bd</span>
            </li>
            <li className="main-footer__contact-item">
              <span className="main-footer__contact-icon">
                <FaClock />
              </span>
              <span>9:00 AM – 5:00 PM (Sat–Thu)</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="main-footer__bottom">
        <div className="main-footer__bottom-content">
          <p className="main-footer__copyright">
            &copy; {new Date().getFullYear()} Dept. of Physics, Government Bangla College. All rights reserved.
          </p>
          <div className="main-footer__bottom-links">
            <Link to="/about" className="main-footer__bottom-link">About Us</Link>
            <Link to="/#contact" className="main-footer__bottom-link">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
