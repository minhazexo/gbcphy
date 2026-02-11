import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../../styles/editProfile.scss";

const EditProfile = () => {
  const { userProfile, logout } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [username, setUsername] = useState("");
  const [roll, setRoll] = useState("");
  const [session, setSession] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setRoll(userProfile.roll || "");
      setSession(userProfile.session || "");
      if (userProfile.profile_image) {
        setPreviewImage(userProfile.profile_image.startsWith("/uploads")
          ? userProfile.profile_image
          : `/uploads/${userProfile.profile_image}`);
      }
    }
  }, [userProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!profileImage && username === userProfile.username && roll === userProfile.roll && session === userProfile.session) {
      setError("No changes detected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("roll", roll);
      formData.append("session", session);
      if (profileImage) formData.append("image", profileImage);

      const response = await axios.post(
        `http://localhost:5010/api/user/${userProfile.id}/editProfile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        navigate("/profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message || "Failed to update profile. Please try again."
      );

      if (err.response?.status === 401) logout();
    }
  };

  return (
    <div className="edit-profile-container">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="image-preview">
          {previewImage ? (
            <img src={previewImage} alt="Profile Preview" className="profile-preview" />
          ) : (
            <p>No image selected</p>
          )}
        </div>

        <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" id="file-input" />
        <label htmlFor="file-input" className="file-input-label">Choose Image</label>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="username-input"
        />

        <input
          type="text"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          placeholder="Enter roll"
          className="roll-input"
        />

        <input
          type="text"
          value={session}
          onChange={(e) => setSession(e.target.value)}
          placeholder="Enter session"
          className="session-input"
        />

        <button type="submit" className="btn-save">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfile;
