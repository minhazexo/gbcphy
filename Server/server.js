const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const { GridFSBucket } = require("mongodb");
const User = require("./models/User"); // Adjust the path according to your file structure
const authRoutes = require("./routes/auth"); // Auth routes
const userRoutes = require("./routes/user"); // User routes

dotenv.config();
console.log(process.env.MONGODB_URI); // Load environment variables from .env file

const app = express();

// Enable CORS for all routes
const cors = require("cors");

const allowedOrigins = ["https://gbc-dop.netlify.app",];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// Middleware for parsing JSON and URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB URI and connection
const MONGODB_URI = process.env.MONGODB_URI;

// Establish a connection using mongoose.connect for better logging
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const conn = mongoose.connection;
let gfsBucket;

// Initialize GridFSBucket once the connection is open
conn.once("open", () => {
  console.log("MongoDB connection open");
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

// Configure GridFS storage for multer
const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: (req, file) => ({
    filename: file.originalname,
    bucketName: "uploads", // Specifies the collection for storing files
  }),
});

// Middleware for handling file uploads
const upload = multer({ storage });

// Endpoint to handle profile image upload
app.post(
  "/api/user/:userId/uploadProfileImage",
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("Uploaded file:", req.file); // Log uploaded file for debugging
    const userId = req.params.userId;
    try {
      await User.findByIdAndUpdate(userId, { profileImageId: req.file.id });
      res.status(201).json({ message: "Profile image uploaded successfully" });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  }
);

// Route to fetch profile image by GridFS file ID
app.get("/api/user/:userId/profileImage", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user || !user.profileImageId) {
      return res
        .status(404)
        .json({ message: "User or profile image not found" });
    }

    // Find the file in the GridFSBucket
    const cursor = gfsBucket.find({ _id: user.profileImageId });
    const file = await cursor.next();

    if (!file) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set("Content-Type", file.contentType);
    const readStream = gfsBucket.openDownloadStream(file._id);
    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("Error streaming the image:", err);
      res.status(500).json({ message: "Failed to stream profile image" });
    });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ message: "Failed to fetch profile image" });
  }
});

// Import and use routes for authentication and user updates
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Serve static files and React app build
app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.statusCode || 500,
    message: err.message || "Internal Server Error",
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
