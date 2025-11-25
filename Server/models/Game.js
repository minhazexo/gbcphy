const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  white_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  black_player_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room_code: { type: String, unique: true, required: true },
  game_status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
  winner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  result: { type: String, enum: ['white_win', 'black_win', 'draw'] },
  pgn_moves: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);
