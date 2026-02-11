import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";
import ChessBoard from "../../components/Chessboard/ChessBoard";

const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:5010";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5010";

const socket = io(WS_URL, { transports: ["websocket"] });

export default function Chess() {
  const { userProfile } = useAuth();
  const [room, setRoom] = useState(null);
  const [game, setGame] = useState({
    _id: "temp-game",
    room_code: "demo",
    started: false,
  });
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("Waiting for opponent...");

  const token = localStorage.getItem("authToken");

  // Create room
  const createRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/api/games/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_private: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create room");
      setRoom(data);
      setGame({ ...game, _id: data._id, room_code: data.room_code, started: false });
      setStatus("Room created. Waiting for opponent...");
      socket.emit("room:create", { room_code: data.room_code, user_id: userProfile?._id });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Join room
  const joinRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/api/games/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_code: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join room");
      setRoom(data.room);
      setGame({
        _id: data.game?._id || game._id,
        room_code: joinCode,
        started: !!data.game,
      });
      setStatus(data.game ? "Game started!" : "Waiting for opponent...");
      socket.emit("room:join", { room_code: joinCode, user_id: userProfile?._id });
      if (data.game) socket.emit("game:start", { room_code: joinCode, game_id: data.game._id });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Listen for game start
  useEffect(() => {
    const handleGameStarted = (payload) => {
      setGame({ _id: payload.game_id, room_code: payload.room_code, started: true });
      setStatus("Game started!");
    };
    socket.on("game:started", handleGameStarted);
    return () => socket.off("game:started", handleGameStarted);
  }, []);

  return (
    <div className="chess-page">
      <div className="chess-controls glass">
        <button onClick={createRoom}>Create Room</button>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter room code"
        />
        <button onClick={joinRoom}>Join Room</button>
        {room && <p><b>Room:</b> {room.room_code}</p>}
      </div>

      <p className="game-status">{status}</p>

      {/* Always render the board, even if game not started */}
      <ChessBoard
        socket={socket}
        roomCode={game.room_code}
        gameId={game._id}
        gameStarted={game.started}
      />
    </div>
  );
}
