const mongoose = require('mongoose');

const MoveSchema = new mongoose.Schema({
  game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  from_square: { type: String, required: true },
  to_square: { type: String, required: true },
  piece_moved: { type: String },
  move_notation: { type: String },
  move_number: { type: Number, required: true }
}, { timestamps: { createdAt: 'move_timestamp', updatedAt: false } });

module.exports = mongoose.model('Move', MoveSchema);
