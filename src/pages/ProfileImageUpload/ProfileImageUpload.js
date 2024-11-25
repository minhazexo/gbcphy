import React, { useState } from "react";

const ProfileImageUpload = () => {
  const [uploadResponse, setUploadResponse] = useState(null);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUploadResponse(data); // Store the upload response
      console.log(data); // Handle response accordingly
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(file); // Upload the file
    }
  };

  return (
    <div>
      <h2>Upload Profile Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploadResponse && (
        <div>
          <h3>Upload Response:</h3>
          <p>{uploadResponse.message}</p>
          {uploadResponse.imageUrl && (
            <img
              src={uploadResponse.imageUrl} // Use the returned URL for the image
              alt="Uploaded Profile"
              style={{ maxWidth: "100%", marginTop: "10px" }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
