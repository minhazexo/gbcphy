import React, { useState, useEffect } from "react";
import "../../styles/home.scss";
import Hero from "../../components/Home/Hero.js";
import Body from "../../components/Home/Body.js";
import { getNotices, subscribeToContent } from "../../data/contentStore.js";
import { DEPARTMENT } from "../../data/department.js";

const Home = () => {
  // Notices are managed in /admin and kept in the local content store
  const [notices, setNotices] = useState(getNotices);
  useEffect(() => subscribeToContent(() => setNotices(getNotices())), []);

  const departmentInfo = { ...DEPARTMENT, notices };

  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Professional SEO: title, meta description, JSON-LD (CollegeOrUniversity)
  useEffect(() => {
    document.title = DEPARTMENT.seo.title;

    const metaName = "description";
    const metaContent = DEPARTMENT.seo.description;
    let meta = document.querySelector(`meta[name="${metaName}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", metaName);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", metaContent);

    const ldId = "dept-physics-jsonld";
    let ld = document.getElementById(ldId);
    if (!ld) {
      ld = document.createElement("script");
      ld.id = ldId;
      ld.type = "application/ld+json";
      document.head.appendChild(ld);
    }
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      name: `${DEPARTMENT.name}, ${DEPARTMENT.college}`,
      parentOrganization: [
        { "@type": "CollegeOrUniversity", name: DEPARTMENT.college },
        { "@type": "CollegeOrUniversity", name: DEPARTMENT.universityInfo.name, url: DEPARTMENT.universityInfo.website }
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: DEPARTMENT.contact.street,
        addressLocality: DEPARTMENT.contact.locality,
        addressCountry: DEPARTMENT.contact.country
      },
      url: window.location.origin,
      description: metaContent
    });

    return () => {
      const stale = document.getElementById(ldId);
      if (stale) stale.remove();
    };
  }, []);

  return (
    <div className="home-container" data-scroll-container>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div className="home-content">
        <Hero departmentInfo={departmentInfo} scrolled={scrolled} />
        <Body departmentInfo={departmentInfo} scrolled={scrolled} />
      </div>
    </div>
  );
};

export default Home;