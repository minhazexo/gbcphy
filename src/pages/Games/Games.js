import React from "react";
import { Link } from "react-router-dom";
import "../../styles/games.scss"; // Optional: for styling

function Games() {
  return (
    <div className="games-container">
      <h2>🎮 Games Zone</h2>
      <div className="game-links">
        <Link to="/snakegame" className="game-card">
          🐍 Snake Game
        </Link>
        <Link to="/flappybird" className="game-card">
          🐦 Flappy Bird
        </Link>
        {/* Add more games here */}
      </div>
    </div>
  );
}

export default Games;
