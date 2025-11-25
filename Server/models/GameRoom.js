const mongoose = require('mongoose');

const GameRoomSchema = new mongoose.Schema({
  room_code: { type: String, unique: true, required: true },
  created_by_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  is_private: { type: Boolean, default: false },
  max_players: { type: Number, default: 2 },
  current_players_count: { type: Number, default: 1 },
  expires_at: { type: Date }
}, { timestamps: { createdAt: 'created_at', updatedAt: true } });

module.exports = mongoose.model('GameRoom', GameRoomSchema);
