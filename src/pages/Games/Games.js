import React from "react";
import { Link } from "react-router-dom";
import "../../styles/games.scss"; // Optional: your custom styles

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
        <Link to="/chessgame" className="game-card">
          ♟️ Chess Game
        </Link>
      </div>
    </div>
  );
}

export default Games;
