const express = require('express');
const User = require('../models/User'); // Adjust the path according to your structure
const { verifyToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads")); // Ensure correct path for uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  },
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  if (!req) 
  { new Error ("Request not found") }
  const allowedTypes = /jpeg|jpg|png/;
  const isValidFile = allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype);

  if (isValidFile) {
    return cb(null, true);
  } else {
    return cb(new Error("Only images are allowed (jpeg, jpg, png)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 }, // 5MB limit or from env variable
});

// Validation rules for updating profile
const validateProfileUpdate = [
  body('username').optional().isString().withMessage('Username must be a string'),
];

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile with profile image
router.put(
  "/profile",
  verifyToken,
  upload.single("profileImage"), // Middleware to handle file upload
  validateProfileUpdate,
  async (req, res) => {
    // Validate incoming request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.userId; // Get user ID from the token
      const { username } = req.body;

      // Prepare update data object
      const updateData = {};
      if (username) {
        updateData.username = username; // Update username if provided
      }
      if (req.file) {
        updateData.profileImage = req.file.path.replace(/\\/g, "/"); // Use forward slashes
      }

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password"); // Get the updated user without the password

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Send a success response with updated user info
      res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router; // Use CommonJS export