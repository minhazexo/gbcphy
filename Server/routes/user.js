const express = require("express");
const router = express.Router();
const db = require("../db"); // promise-based pool
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");

// ---------- Multer storage ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); // ensure folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

const upload = multer({ storage });

// ---------- JWT Middleware ----------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ---------- GET User Profile ----------
router.get("/:id/profile", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only fetch their own profile
    if (parseInt(id) !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await db.query(
      "SELECT id, username, email, roll, session, profile_image FROM users WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) return res.status(404).json({ message: "User not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("GET /user/:id/profile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------- POST Edit Profile ----------
router.post("/:id/editProfile", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, roll, session } = req.body;
    const image = req.file ? req.file.filename : null;

    if (parseInt(id) !== req.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Build dynamic query
    const fields = [];
    const params = [];

    if (username) {
      fields.push("username = ?");
      params.push(username);
    }
    if (roll) {
      fields.push("roll = ?");
      params.push(roll);
    }
    if (session) {
      fields.push("session = ?");
      params.push(session);
    }
    if (image) {
      fields.push("profile_image = ?");
      params.push(image);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    params.push(id);

    const [result] = await db.query(sql, params);

    // Return updated user data
    const [updatedRows] = await db.query(
      "SELECT id, username, email, roll, session, profile_image FROM users WHERE id = ?",
      [id]
    );

    res.json({ message: "Profile updated successfully", user: updatedRows[0] });
  } catch (err) {
    console.error("POST /user/:id/editProfile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
