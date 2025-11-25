// Server/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { GridFSBucket } = require("mongodb");
const http = require("http");
const { Server: IOServer } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Models & routes
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/posts");

dotenv.config();

const app = express();
console.log("MONGODB_URI:", process.env.MONGODB_URI); // debug env

// ---------- CORS setup ----------
const envClient = process.env.CLIENT_ORIGIN;
const defaultAllowedOrigins = ["https://gbc-dop.netlify.app", "http://localhost:3000"];
const allowedOrigins = envClient ? [envClient, ...defaultAllowedOrigins] : defaultAllowedOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Handle preflight requests globally
app.options("*", cors());

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- MongoDB connection ----------
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const conn = mongoose.connection;
let gfsBucket;
conn.once("open", () => {
  console.log("MongoDB connection open");
  gfsBucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
});

// ---------- GridFS storage ----------
const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => ({
    filename: file.originalname,
    bucketName: "uploads",
  }),
});
const upload = multer({ storage });

// ---------- Profile image routes ----------
app.post("/api/user/:userId/uploadProfileImage", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const userId = req.params.userId;
  try {
    await User.findByIdAndUpdate(userId, { profileImageId: req.file.id });
    res.status(201).json({ message: "Profile image uploaded successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload profile image" });
  }
});

app.get("/api/user/:userId/profileImage", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user || !user.profileImageId) return res.status(404).json({ message: "Image not found" });

    const cursor = gfsBucket.find({ _id: user.profileImageId });
    const file = await cursor.next();
    if (!file) return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", file.contentType || "application/octet-stream");
    gfsBucket.openDownloadStream(file._id).pipe(res)
      .on("error", (err) => {
        console.error("Stream error:", err);
        res.status(500).json({ message: "Failed to stream profile image" });
      });
  } catch (err) {
    console.error("Fetch image error:", err);
    res.status(500).json({ message: "Failed to fetch profile image" });
  }
});

// ---------- API routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

// Serve local uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Chess HTTP routes (optional)
try {
  const chessRoutes = require("./routes/chess");
  if (chessRoutes) {
    app.use("/api/chess", chessRoutes);
    console.log("Mounted /api/chess routes");
  }
} catch {
  console.log("No chess routes found, skipping /api/chess mount");
}

// Serve React build
app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Error middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
});

// ---------- HTTP + Socket.io setup ----------
const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Socket authentication
io.use((socket, next) => {
  try {
    const authToken =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      socket.handshake.query?.token ||
      (socket.handshake.headers?.authorization?.split(" ")[1]);

    if (!authToken) return next(); // allow unauthenticated sockets

    const decoded = jwt.verify(authToken, JWT_SECRET);
    socket.user = {
      user_id: decoded.id || decoded.userId || decoded.user_id,
      email: decoded.email || null,
      role: decoded.role || "student",
    };
    next();
  } catch (err) {
    console.warn("Socket auth failed:", err.message);
    next();
  }
});

// Socket connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id, "user:", socket.user || "anonymous");
});

// Optional chessSocket handler
try {
  const chessSocket = require("./sockets/chessSocket");
  if (typeof chessSocket === "function") {
    chessSocket(io);
    console.log("Loaded Server/sockets/chessSocket.js");
  } else {
    console.log("Server/sockets/chessSocket.js found but does not export a function");
  }
} catch {
  console.log("No Server/sockets/chessSocket.js found (optional)");
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server (with Socket.io) running on http://localhost:${PORT}`);
});
