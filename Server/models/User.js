const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profileImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "uploads.files",
    default: null,
  },
}, {
  timestamps: true,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
