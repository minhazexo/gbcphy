const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const GameRoom = require('../models/GameRoom');
const Game = require('../models/Game');
const Move = require('../models/Move');
const { authenticateToken } = require('../middleware/authMiddleware');

const genRoomCode = () => crypto.randomBytes(4).toString('hex').slice(0, 8);

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const room_code = genRoomCode();
    const room = await GameRoom.create({
      room_code,
      created_by_id: req.user.user_id,
      is_private: !!req.body.is_private
    });
    res.status(201).json(room);
  } catch {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { room_code } = req.body;
    const room = await GameRoom.findOne({ room_code });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.current_players_count >= room.max_players) return res.status(409).json({ error: 'Room full' });

    room.current_players_count += 1;
    await room.save();

    let game = await Game.findOne({ room_code });
    if (!game && room.current_players_count === 2) {
      game = await Game.create({
        white_player_id: room.created_by_id,
        black_player_id: req.user.user_id,
        room_code,
        game_status: 'ongoing'
      });
      room.game_id = game._id;
      await room.save();
    }
    res.json({ room, game });
  } catch {
    res.status(500).json({ error: 'Failed to join room' });
  }
});

router.get('/active', authenticateToken, async (req, res) => {
  const games = await Game.find({ game_status: 'ongoing' }).sort({ createdAt: -1 }).limit(50);
  res.json(games);
});

router.get('/:gameId', authenticateToken, async (req, res) => {
  const game = await Game.findById(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game);
});

router.post('/:gameId/move', authenticateToken, async (req, res) => {
  const { gameId } = req.params;
  const { from_square, to_square, piece_moved, move_notation, move_number } = req.body;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  if (game.game_status !== 'ongoing') return res.status(409).json({ error: 'Game not active' });

  await Move.create({ game_id: gameId, from_square, to_square, piece_moved, move_notation, move_number });
  game.pgn_moves = `${(game.pgn_moves || '').trim()} ${move_notation}`.trim();
  await game.save();
  res.status(201).json({ ok: true });
});

router.get('/leaderboard', authenticateToken, async (req, res) => {
  const User = require('../models/User');
  const users = await User.find({}, 'username rating wins losses draws').sort({ rating: -1, wins: -1 }).limit(100);
  res.json(users);
});

module.exports = router;
