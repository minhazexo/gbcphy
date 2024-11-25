import React from "react";

const ClassRoutine = () => {
  return (
    <div className="class-routine-container">
      <img
        src={`${process.env.PUBLIC_URL}/Class Routine/Class Routine.jpg`} // Path to the image
        alt="Class Routine"
        className="class-routine-image"
      />
    </div>
  );
};

export default ClassRoutine; 