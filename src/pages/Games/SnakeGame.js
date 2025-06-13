import React, { useEffect, useRef, useState, useCallback } from 'react';

const SnakeGame = ({ onValueChange }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const lastTimeRef = useRef(0);

  const [gameOver, setGameOver] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [score, setScore] = useState(0);

  const grid = 20;
  const canvasSize = 600;
  const frameInterval = 100;

  const snake = useRef({
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4,
  });

  const apple = useRef({
    x: 60,
    y: 60,
  });

  // Audio elements
  const eatSound = useRef(new Audio('/sound/food.mp3'));
  const moveSound = useRef(new Audio('/sound/move.mp3'));
  const gameOverSound = useRef(new Audio('/sound/gameover.mp3'));
  const music = useRef(new Audio('/sound/music.mp3'));

  const appleImg = useRef(new Image());
  appleImg.current.src = '/images/apple.png';

  const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

  // Wrap resetGame in useCallback to stabilize its reference
  const resetGame = useCallback(() => {
    snake.current = {
      x: 160,
      y: 160,
      dx: grid,
      dy: 0,
      cells: [],
      maxCells: 4,
    };
    apple.current = {
      x: getRandomInt(0, canvasSize / grid) * grid,
      y: getRandomInt(0, canvasSize / grid) * grid,
    };
    setScore(0);
    if (onValueChange) onValueChange(0);
    setGameOver(false);
    lastTimeRef.current = 0;
  }, [grid, canvasSize, onValueChange]);

  // Wrap draw in useCallback to stabilize reference
  const draw = useCallback((ctx, time) => {
    if (!ctx) return;

    const s = snake.current;
    const a = apple.current;

    const hue = (time / 50) % 360;
    const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    gradient.addColorStop(0, `hsl(${hue}, 70%, 90%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 80%, 70%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    s.x += s.dx;
    s.y += s.dy;

    if (s.x < 0) s.x = canvasSize - grid;
    else if (s.x >= canvasSize) s.x = 0;

    if (s.y < 0) s.y = canvasSize - grid;
    else if (s.y >= canvasSize) s.y = 0;

    s.cells.unshift({ x: s.x, y: s.y });
    if (s.cells.length > s.maxCells) s.cells.pop();

    ctx.drawImage(appleImg.current, a.x, a.y, grid, grid);

    for (let i = 0; i < s.cells.length; i++) {
      const cell = s.cells[i];
      const shade = Math.floor(255 - (i * 180) / s.cells.length);
      ctx.fillStyle = `rgb(${shade}, ${150}, ${shade})`;

      ctx.beginPath();
      ctx.arc(cell.x + grid / 2, cell.y + grid / 2, grid / 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (i === 0) {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(cell.x + 5, cell.y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cell.x + grid - 5, cell.y + 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (cell.x === a.x && cell.y === a.y) {
        s.maxCells++;
        setScore(prevScore => {
          const newScore = prevScore + 1;
          if (onValueChange) onValueChange(newScore);
          return newScore;
        });

        eatSound.current.currentTime = 0;
        eatSound.current.play().catch(() => {});

        a.x = getRandomInt(0, canvasSize / grid) * grid;
        a.y = getRandomInt(0, canvasSize / grid) * grid;
      }

      for (let j = i + 1; j < s.cells.length; j++) {
        if (cell.x === s.cells[j].x && cell.y === s.cells[j].y) {
          setGameOver(true);
          gameOverSound.current.currentTime = 0;
          gameOverSound.current.play().catch(() => {});
          if (!musicMuted && !music.current.paused) {
            music.current.pause();
          }
          cancelAnimationFrame(animationFrameId.current);
        }
      }
    }
  }, [canvasSize, grid, musicMuted, onValueChange]);

  const handleKeyDown = (e) => {
    const s = snake.current;
    if (e.key === 'ArrowLeft' && s.dx === 0) {
      s.dx = -grid;
      s.dy = 0;
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    } else if (e.key === 'ArrowUp' && s.dy === 0) {
      s.dy = -grid;
      s.dx = 0;
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    } else if (e.key === 'ArrowRight' && s.dx === 0) {
      s.dx = grid;
      s.dy = 0;
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    } else if (e.key === 'ArrowDown' && s.dy === 0) {
      s.dy = grid;
      s.dx = 0;
      moveSound.current.currentTime = 0;
      moveSound.current.play().catch(() => {});
    }
  };

  const playMusic = useCallback(() => {
    if (!musicMuted) {
      music.current.loop = true;
      music.current.volume = 0.2;
      if (music.current.paused) {
        music.current.play().catch(() => {});
      }
    }
  }, [musicMuted]);

  const pauseMusic = useCallback(() => {
    if (!music.current.paused) {
      music.current.pause();
    }
  }, []);

  useEffect(() => {
    resetGame();

    const startMusicOnInteraction = () => {
      playMusic();
      window.removeEventListener('keydown', startMusicOnInteraction);
      window.removeEventListener('click', startMusicOnInteraction);
    };

    window.addEventListener('keydown', startMusicOnInteraction);
    window.addEventListener('click', startMusicOnInteraction);

    const loop = (time = 0) => {
      if (!canvasRef.current) {
        cancelAnimationFrame(animationFrameId.current);
        return;
      }
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      animationFrameId.current = requestAnimationFrame(loop);

      if (time - lastTimeRef.current < frameInterval) return;

      if (!gameOver) {
        draw(ctx, time);
      }

      lastTimeRef.current = time;
    };

    animationFrameId.current = requestAnimationFrame(loop);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', startMusicOnInteraction);
      window.removeEventListener('click', startMusicOnInteraction);
      pauseMusic();
    };
  }, [gameOver, musicMuted, pauseMusic, playMusic, resetGame, draw]); // <-- added resetGame and draw here

  useEffect(() => {
    if (!gameOver && !musicMuted) {
      playMusic();
    } else {
      pauseMusic();
    }
  }, [gameOver, musicMuted, playMusic, pauseMusic]);

  return (
    <>
      {/* Gradient animation injected here */}
      <style>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animated-bg {
          background: linear-gradient(270deg,rgb(46, 34, 207),rgb(224, 16, 16),rgb(16, 229, 80),rgb(246, 226, 11));
          background-size: 800% 800%;
          animation: gradientAnimation 15s ease infinite;
        }
      `}</style>

      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url("/images/snakebg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          className="animated-bg"
          style={{
            position: 'relative',
            padding: 24,
            borderRadius: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '8px solid #2563eb',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: 16,
              color: '#2563eb',
              userSelect: 'none',
            }}
          >
            Score: {score}
          </div>

          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            style={{
              display: 'block',
              backgroundColor: '#dbeafe',
              border: '4px solid rgb(239, 12, 12)',
              borderRadius: 8,
            }}
          />

          <button
            onClick={() => setMusicMuted(!musicMuted)}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              fontSize: '1rem',
              backgroundColor: musicMuted ? '#ef4444' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = musicMuted ? '#b91c1c' : '#1e40af')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = musicMuted ? '#ef4444' : '#2563eb')
            }
            aria-label={musicMuted ? 'Unmute music' : 'Mute music'}
          >
            {musicMuted ? 'Unmute Music 🔈' : 'Mute Music 🔇'}
          </button>

          {gameOver && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                textAlign: 'center',
                zIndex: 10,
                userSelect: 'none',
              }}
            >
              <h1
                style={{
                  fontSize: '2.5rem',
                  color: '#dc2626',
                  marginBottom: 16,
                  fontWeight: 'bold',
                }}
              >
                Game Over
              </h1>
              <button
                onClick={() => {
                  resetGame();
                  setGameOver(false);
                }}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  fontSize: '1.25rem',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#1e40af')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#2563eb')}
              >
                Restart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SnakeGame;
