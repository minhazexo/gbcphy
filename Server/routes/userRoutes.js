const express = require("express");
const multer = require("multer");
const User = require("../models/User"); // Adjust the path according to your file structure
const router = express.Router();
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");

const conn = mongoose.connection;
let gfs;

// Initialize GridFS when MongoDB connection opens
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads"); // Define the collection for storing images
});

// Configure multer for file uploads (using memory storage for GridFS)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to update user profile, allowing username and profile image updates
router.put("/:id/profile", upload.single("profileImage"), async (req, res) => {
  console.log("Profile update request received for ID:", req.params.id);

  try {
    const userId = req.params.id; // Extract user ID from the route parameter
    const { username } = req.body; // Extract username from the request body

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Update username if it's provided
    if (username) user.username = username;

    // Handle profile image upload if a new image is provided
    if (req.file) {
      // Delete existing image from GridFS, if there is one
      if (user.profileImageId) {
        await gfs.remove({ _id: user.profileImageId, root: "uploads" }, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }

      // Create a GridFS write stream for the new image
      const writeStream = gfs.createWriteStream({
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      // Handle success and error events for the write stream
      writeStream.on("finish", async (file) => {
        user.profileImageId = file._id; // Save the new file ID to the user profile
        await user.save(); // Save user profile with updated image ID
        res.status(200).json({ message: "Profile updated successfully." });
      });

      writeStream.on("error", (error) => {
        console.error("Error saving file:", error);
        res.status(500).json({ message: "Failed to save image." });
      });

      // Write the uploaded file buffer to GridFS
      writeStream.write(req.file.buffer);
      writeStream.end();
    } else {
      // If no new image, save only the updated username
      await user.save();
      res.status(200).json({ message: "Profile updated successfully." });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile." });
  }
});

module.exports = router;
