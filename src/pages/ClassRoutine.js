import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/classRoutine.scss";

const ClassRoutine = () => {
  const navigate = useNavigate();

  return (
    <div className="class-routine-page">
      <div className="class-routine-container">
        <h1>Class Routine</h1>
        <img
          src="/ClassRoutine/routine.jpg"
          alt="Class Routine"
          className="class-routine-image"
        />
        <button className="back-button" onClick={() => navigate("/academic")}>
          ← Back to Academic Page
        </button>
      </div>
    </div>
  );
};

export default ClassRoutine; 