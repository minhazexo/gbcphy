const { MongoClient, GridFSBucket } = require("mongodb");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: "c:/Users/LEnevo/OneDrive/Desktop/DOP/Server/.env" }); // or specify the path if needed

// Debugging logs
console.log("Environment Variables:", process.env);
console.log("MongoDB URI:", process.env.MONGODB_URI);
console.log("Port:", process.env.PORT);

async function uploadFile() {
  const uri = process.env.MONGODB_URI; // Get MongoDB URI from .env
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("dop"); // Use your correct database name
    const bucket = new GridFSBucket(database, {
      bucketName: "uploads", // Use your bucket name (keep it the same for consistency)
    });

    const filePath = path.join(__dirname, "path_to_your_image.jpg"); // Adjust to your actual file path

    if (!fs.existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      return;
    }

    const uploadStream = bucket.openUploadStream("your_image_name.jpg"); // Name the image file
    const fileStream = fs.createReadStream(filePath);

    fileStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      console.log("File uploaded successfully");
      client.close();
    });

    uploadStream.on("error", (error) => {
      console.error("Error uploading file:", error);
      client.close();
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = { uploadFile };
