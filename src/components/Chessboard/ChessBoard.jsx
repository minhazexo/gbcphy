import React, { useEffect, useState } from "react";
import { Chess } from "chess.js";
import "./ChessBoard.scss";

export default function ChessBoard({ socket, roomCode, gameId, gameStarted = false }) {
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [turn, setTurn] = useState("w");
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState("Local Game");

  // Update status when gameStarted changes
  useEffect(() => {
    if (gameStarted) {
      setStatus(turn === "w" ? "White's turn" : "Black's turn");
    } else {
      setStatus("Waiting to start...");
    }
  }, [gameStarted, turn]);

  // Handle square click
  const handleSquareClick = (rowIdx, colIdx) => {
    if (!gameStarted) return; // Disable moves until game starts

    const square = board[rowIdx][colIdx];
    const squareName = String.fromCharCode(97 + colIdx) + (8 - rowIdx);

    if (selectedSquare) {
      // Attempt move
      try {
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
          
          // No socket emit in local mode
        } else {
          // Invalid move
          setSelectedSquare(null);
        }
      } catch (e) {
        // Handle move error (e.g. from chess.js)
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
