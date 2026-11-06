// About page — Department of Physics, Govt. Bangla College

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaBuilding,
  FaUsers,
  FaFlask,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import "./about.scss";
import "./about.scss";

const About = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview", icon: FaBuilding },
    { key: "mission", label: "Mission & Vision", icon: FaGraduationCap },
    { key: "faculty", label: "Faculty", icon: FaUsers },
    { key: "contact", label: "Contact", icon: FaMapMarkerAlt },
  ];

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="about-header__badge">Government Bangla College</div>
        <h1 className="about-header__title">Department of Physics</h1>
        <p className="about-header__subhead">
          Exploring the fundamental laws of nature — from subatomic particles to the vast cosmos.
        </p>
      </header>

      <nav className="about-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              className={`about-tab ${isActive ? "about-tab--active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={isActive}
            >
              <Icon size={16} className="about-tab__icon" />
              <span className="about-tab__label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <section className={`about-panel ${activeTab}`}>
        {activeTab === "overview" && (
          <>
            <div className="about-grid about-grid--two">
              <div className="about-card">
                <div className="about-card__icon">
                  <FaBuilding size={28} />
                </div>
                <h3 className="about-card__title">Established</h3>
                <p className="about-card__text">
                  The Department of Physics at Government Bangla College has been nurturing
                  scientific thinking since the college's founding, preparing students for careers
                  in academia, research, and industry.
                </p>
              </div>
              <div className="about-card">
                <div className="about-card__icon">
                  <FaFlask size={28} />
                </div>
                <h3 className="about-card__title">Academic Programs</h3>
                <p className="about-card__text">
                  We offer B.Sc. (Honours) and M.Sc. programs under Dhaka Central University,
                  combining comprehensive theory with hands-on laboratory work and research
                  opportunities.
                </p>
              </div>
              <div className="about-card">
                <div className="about-card__icon">
                  <FaUsers size={28} />
                </div>
                <h3 className="about-card__title">Expert Faculty</h3>
                <p className="about-card__text">
                  Learn from qualified and dedicated professors guiding the next generation of
                  physicists through mentorship and research supervision.
                </p>
              </div>
              <div className="about-card">
                <div className="about-card__icon">
                  <FaGraduationCap size={28} />
                </div>
                <h3 className="about-card__title">Research Focus</h3>
                <p className="about-card__text">
                  Our research spans theoretical and experimental physics, with emphasis on
                  practical applications and interdisciplinary collaboration.
                </p>
              </div>
            </div>
            <div className="about-cta">
              <p className="about-cta__text">
                Ready to begin your physics journey?
              </p>
              <Link to="/academic" className="about-cta__btn">
                Explore Programs
              </Link>
            </div>
          </>
        )}

        {activeTab === "mission" && (
          <div className="about-grid about-grid--two">
            <div className="about-card about-card--mission">
              <div className="about-card__icon about-card__icon--mission">
                <FaGraduationCap size={28} />
              </div>
              <h3 className="about-card__title">Our Mission</h3>
              <p className="about-card__text">
                To provide quality education in physics through comprehensive academic programs,
                practical laboratory work, and research opportunities — nurturing scientific
                thinking and preparing students for successful careers.
              </p>
            </div>
            <div className="about-card about-card--vision">
              <div className="about-card__icon about-card__icon--vision">
                <FaFlask size={28} />
              </div>
              <h3 className="about-card__title">Our Vision</h3>
              <p className="about-card__text">
                To be a center of excellence in physics education and research, producing
                graduates who contribute to scientific advancement and national development.
              </p>
            </div>
          </div>
        )}

        {activeTab === "faculty" && (
          <div className="about-faculty">
            <h3 className="about-faculty__title">Meet Our Faculty</h3>
            <p className="about-faculty__subhead">
              Qualified and dedicated educators guiding the next generation of physicists.
            </p>
            <div className="about-faculty__grid">
              <div className="about-faculty__card">
                <div className="about-faculty__photo">A.K.</div>
                <h4 className="about-faculty__name">Prof. Abdul Kashem</h4>
                <p className="about-faculty__title-small">Principal & Head of Department</p>
              </div>
              <div className="about-faculty__card">
                <div className="about-faculty__photo">M.R.</div>
                <h4 className="about-faculty__name">Dr. M. Rahman</h4>
                <p className="about-faculty__title-small">Associate Professor</p>
              </div>
              <div className="about-faculty__card">
                <div className="about-faculty__photo">S.A.</div>
                <h4 className="about-faculty__name">Ms. S. Akter</h4>
                <p className="about-faculty__title-small">Assistant Professor</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="about-contact">
            <h3 className="about-contact__title">Get in Touch</h3>
            <div className="about-contact__grid">
              <div className="about-contact__item">
                <span className="about-contact__icon">
                  <FaMapMarkerAlt size={18} />
                </span>
                <div>
                  <strong>Location</strong>
                  <p>Mirpur, Dhaka, Bangladesh</p>
                </div>
              </div>
              <div className="about-contact__item">
                <span className="about-contact__icon">
                  <FaPhone size={18} />
                </span>
                <div>
                  <strong>Phone</strong>
                  <p>+880 2-XXX-XXXX</p>
                </div>
              </div>
              <div className="about-contact__item">
                <span className="about-contact__icon">
                  <FaEnvelope size={18} />
                </span>
                <div>
                  <strong>Email</strong>
                  <p>physics@gbcl.edu.bd</p>
                </div>
              </div>
              <div className="about-contact__item">
                <span className="about-contact__icon">
                  <FaClock size={18} />
                </span>
                <div>
                  <strong>Hours</strong>
                  <p>9:00 AM – 5:00 PM (Sat–Thu)</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default About;
