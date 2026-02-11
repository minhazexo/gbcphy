// server/routes/auth.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // mysql2/promise pool
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// ---------- REGISTER ----------
router.post(
  "/register",
  [
    body("username").notEmpty().trim().withMessage("Username required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password too short"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
      if (existing.length > 0) return res.status(400).json({ error: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
        [username, email, hashed]
      );

      res.json({ message: "User registered successfully", userId: result.insertId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    res.json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
