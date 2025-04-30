import React, { useState } from "react";
import "../../styles/academic.scss";

const Notes = () => {
  const [selectedYear, setSelectedYear] = useState("First Year");
  const [selectedType, setSelectedType] = useState("Notes");
  const [showRoutineImage, setShowRoutineImage] = useState(false); // State to toggle the image viewer

  // Notes Data (Updated Second Year Notes with PDF Links)
  const notes = {
    "First Year": [
      { title: " NM Calculus-1", url:  "/public/1st Year Notes/NM Stat.pdf" },
      { title: "NM Analytical And Vector", url: "/public/1st Year Notes/NM Analytical And Vector.pdf" },
      { title: " NM Statistics", url: "/public/1st Year Notes/NM Stat.pdf" },
      { title:"Electricity And Magnetism", url: "/public/1st Year Notes/Electricity And Magnetism.pdf" },
    ],
    "Second Year": [
      { title: "Optics (PHA 201)(Emon 20-21)", url: "/2nd Year Notes/EMON { PHA 201 (OPTICS) }_compressed.pdf" },
      { title: "Electronics 1 (PHA 202)(Emon 20-21)", url: "/2nd Year Notes/EMON { PHA 202 (ELECTRONICS 1) }_compressed.pdf" },
      { title: "Mathematical Physics (PHA 203)(Emon 20-21)", url: "/2nd Year Notes/EMON { PHA 203 (MP) }_compressed.pdf" },
      { title: "Atomic & Molecular Physics (PHA 204)(Emon 20-21)", url: "/2nd Year Notes/EMON { PHA 204 (AMP) }_compressed.pdf" },
      { title: "Waves,Oscillations and Advance Mechanics (PHA 205)(Emon 20-21)", url: "/2nd Year Notes/EMON {PHA 205 (WOAM) }_compressed.pdf" },
    ],
    "Third Year": [
      { title: "Lecture 1: Quantum Mechanics", url: "#" },
      { title: "Lecture 2: Thermodynamics", url: "#" },
    ],
    "Fourth Year": [
      { title: "Lecture 1: Advanced Physics", url: "#" },
      { title: "Lecture 2: Nuclear Physics", url: "#" },
    ],
  };

  // Correct Syllabus Paths
  const syllabus = {
    "First Year": [{ title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st%20and%202nd%20Year.pdf" }],
    "Second Year": [{ title: "1st & 2nd Year Syllabus", url: "/Syllabus/1st%20and%202nd%20Year.pdf" }],
    "Third Year": [{ title: "3rd Year Syllabus", url: "/Syllabus/3rd%20Year.pdf" }],
    "Fourth Year": [{ title: "4th Year Syllabus", url: "/Syllabus/4th%20Year.pdf" }],
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const toggleRoutineImage = () => {
    setShowRoutineImage((prevState) => !prevState);
  };

  return (
    <div className="notes-container">
      {/* Class Routine Button */}
      <button className="class-routine-button" onClick={toggleRoutineImage}>
        Class Routine
      </button>

      {/* Show JPG Image */}
      {showRoutineImage && (
        <div className="routine-image-container">
          <img src="/Class Routine/Class Routine.jpg" alt="Class Routine" className="routine-image" />
          <button className="close-button" onClick={toggleRoutineImage}>
            Close
          </button>
        </div>
      )}

      {/* Add the ocean container here */}
      <div className="ocean">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
      </div>

      <h1>Session-wise {selectedType}</h1>
      <div className="dropdown-container">
        <select value={selectedYear} onChange={handleYearChange} className="year-select">
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
          <option value="Third Year">Third Year</option>
          <option value="Fourth Year">Fourth Year</option>
        </select>

        <select value={selectedType} onChange={handleTypeChange} className="type-select">
          <option value="Notes">Notes</option>
          <option value="Syllabus">Syllabus</option>
        </select>
      </div>

      <ul className="notes-list">
        {(selectedType === "Notes" ? notes[selectedYear] : syllabus[selectedYear]).map((item, index) => (
          <li key={index} className="note-item">
            <a href={item.url} className="note-link" target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
