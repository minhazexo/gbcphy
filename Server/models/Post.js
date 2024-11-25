const mongoose = require('mongoose');

// Define the post schema
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Remove extra spaces
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User model
    ref: 'User', // Reference the 'User' model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set default value to current date
  },
});

// Create the Post model
const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
