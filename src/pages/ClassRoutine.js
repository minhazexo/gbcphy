import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/classRoutine.scss";

const ROUTINE_IMAGE_URL = "/images/Routine/Routine.jpg";

const ClassRoutine = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = ROUTINE_IMAGE_URL;
    link.download = "ClassRoutine.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 500);
  };

  return (
    <div className="class-routine-page">
      <div className="class-routine-container">
        <h1>Class Routine</h1>
        <img
          src={ROUTINE_IMAGE_URL}
          alt="Class Routine"
          className="class-routine-image"
        />
        <button className="download-button" onClick={handleDownload} disabled={downloading}>
          {downloading ? "Downloading..." : "📥 Download Routine"}
        </button>
        <button className="back-button" onClick={() => navigate("/academic")}>
          ← Back to Academic Page
        </button>
      </div>
    </div>
  );
};

export default ClassRoutine; 