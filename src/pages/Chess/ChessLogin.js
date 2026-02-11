import "../../styles/chess.scss";

export default function ChessLogin() {
  return (
    <div className="chess-login glass">
      
      {/* Chess Icon */}
      <div className="chess-icon">
        <img 
          src="/images/chessicon/chessicon2.png" 
          alt="Chess Icon" 
        />
      </div>

      <h2>Welcome to Chess Portal</h2>

      <div className="auth-buttons">
        <a href="http://localhost:3000/login" className="auth-btn">
          Login
        </a>

        <a href="http://localhost:3000/register" className="auth-btn">
          Register
        </a>
      </div>
    </div>
  );
}
