// Server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Accept token from "Authorization: Bearer <token>" header
    let token = null;
    const authHeader = req.header("Authorization") || req.header("authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Also accept token in req.body.token or req.query.token for flexibility
    if (!token) token = req.body?.token || req.query?.token;

    if (!token) {
      return res.status(401).json({ message: "Access token is missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize token payload into expected req.user shape
    const user_id = decoded.id || decoded.userId || decoded.user_id || decoded._id || null;
    const email = decoded.email || decoded.mail || null;
    const role = decoded.role || decoded.roles || decoded.userRole || "student";

    req.user = { user_id, email, role };

    return next();
  } catch (error) {
    // token verification failed
    console.error("verifyToken error:", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { verifyToken };
