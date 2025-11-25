import { Link } from "react-router-dom";

export default function ChessDashboard() {
  return (
    <div className="chess-dashboard glass">
      <h1>Chess Dashboard</h1>
      <div className="dashboard-grid">
        <Link to="/profile" className="card">Profile</Link>
        <Link to="/games/chess/offline" className="card">Offline Game</Link>
        <Link to="/games/chess/online" className="card">Online Game</Link>
        <Link to="/games/chess/room" className="card">Create/Join Room</Link>
        <Link to="/games/leaderboard" className="card">Leaderboard</Link>
      </div>
    </div>
  );
}
