import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ChessBoard from "../../components/Chessboard/ChessBoard";

// Mock socket for local play
const mockSocket = {
  on: () => {},
  off: () => {},
  emit: () => {},
};

export default function Chess() {
  const { userProfile } = useAuth();
  const [game, setGame] = useState({
    _id: "local-game",
    room_code: "LOCAL",
    started: true, // Default to started for local play
  });
  const [status, setStatus] = useState("Local Play Mode");

  return (
    <div className="chess-page">
      <div className="chess-controls glass">
        <p><b>Mode:</b> Local Play (Offline)</p>
        <p><i>Multiplayer is currently unavailable.</i></p>
      </div>

      <p className="game-status">{status}</p>

      {/* Always render the board, even if game not started */}
      <ChessBoard
        socket={mockSocket}
        roomCode={game.room_code}
        gameId={game._id}
        gameStarted={game.started}
      />
    </div>
  );
}
