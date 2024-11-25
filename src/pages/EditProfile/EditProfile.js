// EditProfile.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios"; // Make sure to use ES6 import here
import "../../styles/editProfile.scss";

const EditProfile = () => {
  const { userProfile, logout, uploadProfilePicture } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      if (userProfile._id) {
        setPreviewImage(
          `http://localhost:5000/api/user/${userProfile._id}/profileImage`
        );
      }
    }
  }, [userProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!profileImage && username === userProfile.username) {
      setError("No changes detected.");
      return;
    }

    const formData = new FormData();
    if (profileImage) formData.append("image", profileImage);
    formData.append("username", username);

    try {
      const token = localStorage.getItem("authToken");
      if (!userProfile || !userProfile._id) {
        throw new Error(
          "User profile not defined or does not have an ID (_id)."
        );
      }

      await uploadProfilePicture(profileImage);

      const response = await axios.get(
        `http://localhost:5000/api/user/${userProfile._id}/profileImage`,
        { username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        navigate("/profile");
      } else {
        setError(
          response.data.message || "Failed to update profile. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        "An error occurred while updating your profile. Please try again."
      );
      logout();
    }
  };

  return (
    <div className="edit-profile-container">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="image-preview">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile Preview"
              className="profile-preview"
            />
          ) : (
            <p>No image selected</p>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          Choose Image
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="username-input"
        />
        <button type="submit" className="btn-save">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
