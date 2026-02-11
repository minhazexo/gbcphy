// Server/models/User.js
const db = require("../db");

const User = {
  create: async ({ username, email, password, profileImage }) => {
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password, profileImage) VALUES (?, ?, ?, ?)",
      [username, email, password, profileImage || null]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  updateProfile: async (id, { username, profileImage }) => {
    await db.execute(
      "UPDATE users SET username = ?, profileImage = ? WHERE id = ?",
      [username, profileImage || null, id]
    );
  },
};

module.exports = User;
