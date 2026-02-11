// server/db.js
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "if0_40539409_minhaz",
  port: process.env.DB_PORT || 3306,
});

// Test connection
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ MySQL connected");
    connection.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
})();

module.exports = db;
