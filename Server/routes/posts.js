const express = require("express");
const Post = require("../models/Post");
const router = express.Router();

// Create a new post
router.post("/", async (req, res) => {
  const { title, content, userId } = req.body;
  
  if (!title || !content || !userId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newPost = new Post({ title, content, userId });
    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Sort posts by createdAt, descending order
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
});

module.exports = router;
