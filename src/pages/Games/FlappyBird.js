// src/pages/Games/FlappyBird.js
import React from "react";

function FlappyBird() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src="/Games/FlappyBird/index.html"
        title="Flappy Bird"
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
}

export default FlappyBird;
