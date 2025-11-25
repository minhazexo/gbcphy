import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import "./ChessBoard.scss";

export default function ChessBoard({ socket, roomCode, gameId, gameStarted = false }) {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [turn, setTurn] = useState("w");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState("Waiting for opponent...");

  // Update status when gameStarted changes
  useEffect(() => {
    if (gameStarted) {
      setStatus(turn === "w" ? "White's turn" : "Black's turn");
    } else {
      setStatus("Waiting for opponent...");
    }
  }, [gameStarted, turn]);

  // Handle incoming moves from Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleMove = ({ from, to, fen, turn }) => {
      chess.load(fen);
      setBoard(chess.board());
      setTurn(turn);
      setStatus(turn === "w" ? "White's turn" : "Black's turn");
    };

    socket.on("game:move", handleMove);

    return () => socket.off("game:move", handleMove);
  }, [socket, chess]);

  // Handle square click
  const handleSquareClick = (rowIdx, colIdx) => {
    if (!gameStarted) return; // Disable moves until game starts

    const square = board[rowIdx][colIdx];
    const squareName = String.fromCharCode(97 + colIdx) + (8 - rowIdx);

    if (selectedSquare) {
      // Attempt move
      const move = chess.move({
        from: selectedSquare,
        to: squareName,
        promotion: "q", // default promotion
      });

      if (move) {
        setBoard(chess.board());
        setSelectedSquare(null);
        setTurn(chess.turn());
        setStatus(chess.turn() === "w" ? "White's turn" : "Black's turn");

        // Emit move to server
        socket.emit("game:move", {
          room_code: roomCode,
          game_id: gameId,
          from: move.from,
          to: move.to,
          fen: chess.fen(),
          turn: chess.turn(),
        });
      } else {
        // Invalid move
        setSelectedSquare(null);
      }
    } else if (square?.type && square.color === turn) {
      setSelectedSquare(squareName);
    }
  };

  // Render a single square
  const renderSquare = (piece, row, col) => {
    const isLight = (row + col) % 2 === 0;
    const pieceSymbol = piece ? piece.unicode : "";

    const squareName = String.fromCharCode(97 + col) + (8 - row);

    return (
      <div
        key={squareName}
        className={`square ${isLight ? "light" : "dark"} ${
          selectedSquare === squareName ? "selected" : ""
        }`}
        onClick={() => handleSquareClick(row, col)}
      >
        {pieceSymbol}
      </div>
    );
  };

  return (
    <div className="chessboard-container">
      <h3>{status}</h3>
      <div className="chessboard">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="board-row">
            {row.map((square, colIdx) => renderSquare(square, rowIdx, colIdx))}
          </div>
        ))}
      </div>
    </div>
  );
}
