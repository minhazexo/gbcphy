const User = require("../models/User");
const path = require("path");
const fs = require("fs");

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user; // Extract userId from the authenticated token
    const { username } = req.body;
    const profileImage = req.file; // Get the image file from multer

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the username if provided
    if (username) {
      user.username = username;
    }

    // If a new profile image is uploaded, save it to the file system
    if (profileImage) {
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir); // Create the directory if it doesn't exist
      }

      // Define the file path with the user ID and original file name
      const imagePath = path.join(uploadsDir, `${userId}_${profileImage.originalname}`);
      
      // Write the image file to the server
      fs.writeFileSync(imagePath, profileImage.buffer);
      
      // Save the file path in the user's profile (not the URL)
      user.profileImage = imagePath;
    }

    // Save the updated user data
    await user.save();

    // Respond with a success message and updated user data
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        profileImage: user.profileImage,
        email: user.email, // Include other fields if needed
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateProfile };
