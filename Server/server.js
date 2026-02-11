// server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user"); // keep if you have user routes

const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// Test route
// -------------------------
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// -------------------------
// Routes
// -------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// -------------------------
// Serve React build (optional)
// -------------------------
app.use(express.static(path.join(__dirname, "../build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// -------------------------
// Start server
// -------------------------
const PORT = process.env.PORT || 5010;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
