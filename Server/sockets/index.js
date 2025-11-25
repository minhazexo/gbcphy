const { Chess } = require('chess.js');
const Game = require('../models/Game');
const Move = require('../models/Move');

const roomStates = new Map(); // room_code -> { chess, players:[], spectators:[] }

function evaluateStatus(chess) {
  const turn = chess.turn();
  return {
    turn,
    check: chess.isCheck(),
    checkmate: chess.isCheckmate(),
    stalemate: chess.isStalemate(),
    draw: chess.isDraw(),
    ended: chess.isGameOver()
  };
}

async function finalizeGame(game_id, status) {
  const game = await Game.findById(game_id);
  if (!game) return;
  let result = null;
  if (status.checkmate) {
    result = status.turn === 'w' ? 'black_win' : 'white_win';
  } else if (status.draw) {
    result = 'draw';
  }
  game.game_status = 'completed';
  game.result = result;
  game.completed_at = new Date();
  await game.save();

  const User = require('../models/User');
  const white = await User.findById(game.white_player_id);
  const black = await User.findById(game.black_player_id);

  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (black.rating - white.rating) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (white.rating - black.rating) / 400));
  let scoreA = 0.5, scoreB = 0.5;
  if (result === 'white_win') { scoreA = 1; scoreB = 0; }
  if (result === 'black_win') { scoreA = 0; scoreB = 1; }
  white.rating = Math.round(white.rating + K * (scoreA - expectedA));
  black.rating = Math.round(black.rating + K * (scoreB - expectedB));
  if (result === 'white_win') { white.wins += 1; black.losses += 1; }
  else if (result === 'black_win') { black.wins += 1; white.losses += 1; }
  else { white.draws += 1; black.draws += 1; }
  await white.save();
  await black.save();
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('room:create', ({ room_code, user_id }) => {
      socket.join(room_code);
      io.to(room_code).emit('room:created', { room_code, user_id });
    });

    socket.on('room:join', ({ room_code, user_id }) => {
      socket.join(room_code);
      io.to(room_code).emit('room:joined', { room_code, user_id });
    });

    socket.on('game:start', async ({ room_code, game_id }) => {
      const state = { chess: new Chess(), players: [], spectators: [] };
      roomStates.set(room_code, state);
      io.to(room_code).emit('game:started', { game_id, room_code, fen: state.chess.fen(), pgn: state.chess.pgn() });
    });

    socket.on('move:make', async ({ room_code, game_id, user_id, from, to, promotion }) => {
      const state = roomStates.get(room_code);
      if (!state) return;
      const move = state.chess.move({ from, to, promotion });
      if (!move) return;

      await Move.create({
        game_id,
        from_square: from,
        to_square: to,
        piece_moved: move.piece,
        move_notation: move.san,
        move_number: state.chess.history().length
      });

      await Game.findByIdAndUpdate(game_id, { pgn_moves: state.chess.pgn() });

      const status = evaluateStatus(state.chess);
      io.to(room_code).emit('move:made', { fen: state.chess.fen(), pgn: state.chess.pgn(), last: move, status });

      if (status.ended) {
        await finalizeGame(game_id, status);
        io.to(room_code).emit('game:ended', status);
      }
    });

    socket.on('spectate:join', ({ room_code }) => {
      socket.join(room_code);
      io.to(room_code).emit('spectator:joined', {});
    });

    socket.on('disconnecting', () => {
      const roomsLeft = [...socket.rooms].filter((r) => r !== socket.id);
      roomsLeft.forEach((room_code) => io.to(room_code).emit('player:disconnected', {}));
    });
  });
}

module.exports = { registerSocketHandlers };
