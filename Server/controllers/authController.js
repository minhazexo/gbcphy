const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming you have a User model for database operations

// Login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password matches directly (no hashing)
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create a JWT token with the user's ID
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send the token back to the client with user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email, // Add other user info if needed
        username: user.username // Assuming you have a username field
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Optional: Register controller (if needed)
const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = new User({ email, password, username });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, register };
