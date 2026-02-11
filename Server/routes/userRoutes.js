// Server/routes/userRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User"); // Your MySQL helper functions
const authMiddleware = require("../middleware/authMiddleware"); // Protect routes

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ Route: Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const user = await User.findById(userId); // MySQL query
    if (!user) return res.status(404).json({ message: "User not found." });

    delete user.password; // don’t send password
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

// ✅ Route: Update user profile (username + optional image)
router.put("/profile", authMiddleware, upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { username } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    await User.updateProfile(userId, { username, profileImage });

    res.status(200).json({ message: "Profile updated successfully.", profileImage });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

module.exports = router;
