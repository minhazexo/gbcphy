import React, { useState, useEffect } from "react";
import "../../styles/home.scss";
import { FaGraduationCap, FaFlask } from "react-icons/fa";
import Hero from "../../components/Home/Hero.js";
import Body from "../../components/Home/Body.js";

const Home = () => {
  const departmentInfo = {
    name: "Department of Physics",
    college: "Government Bangla College",
    established: 2010,
    facultyCount: 9,
    programs: [
      {
        title: "B.Sc. (Honors) in Physics",
        duration: "4 Years",
        description: "Undergraduate program following National University curriculum",
        icon: <FaGraduationCap />
      },
      {
        title: "M.Sc. in Physics",
        duration: "1 Year", 
        description: "Postgraduate program with research components",
        icon: <FaFlask />
      }
    ],
    researchAreas: [
      {
        title: "Condensed Matter Physics",
        description: "Study of matter in condensed phases"
      },
      {
        title: "Nuclear Physics",
        description: "Research on atomic nuclei and particles"
      },
      {
        title: "Electronics",
        description: "Circuit design and electronic systems"
      },
      {
        title: "Theoretical Physics",
        description: "Mathematical models of physical systems"
      },
      {
        title: "Experimental Physics",
        description: "Laboratory-based research"
      }
    ],
    facilities: [
      {
        title: "Advanced Physics Laboratory",
        description: "State-of-the-art equipment for experiments"
      },
      {
        title: "Electronics Lab", 
        description: "Modern electronics testing equipment"
      },
      {
        title: "Computer Lab",
        description: "High-performance computing facilities"
      },
      {
        title: "Research Equipment",
        description: "Specialized instruments for research"
      }
    ],
    testimonials: [
      {
        text: "The department provided excellent research facilities and guidance for my postgraduate studies.",
        author: "Dr. Mohammad Ali",
        position: "Research Scientist"
      },
      {
        text: "The curriculum is well-structured and prepares students for both academia and industry.",
        author: "Sarah Khan",
        position: "Former Student, M.Sc."
      }
    ]
  };

  const [scrolled, setScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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