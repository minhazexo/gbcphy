const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken"); // Corrected import for jwt
const router = express.Router();

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to the request object
    next();
  } catch (error) {
    console.error("Invalid token:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user instance
    const user = new User({ username, email, password });

    // Save the user to the database
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  console.log("Login request received:", req.body); // Log the incoming request body
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check the password
    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, redirect: "/profile" });
  } catch (error) {
    console.error("Login error:", error); // Log errors in the login process
    res.status(500).json({ message: "Server error" });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract userId from the verified token
    const user = await User.findById(userId).select("-password"); // Exclude the password from the response

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
