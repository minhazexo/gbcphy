import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/profile.scss";
import { FaUserCircle } from "react-icons/fa";
import { fetchProfile, updateProfile } from "../../api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [roll, setRoll] = useState("");
  const [session, setSession] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  // Load profile on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setUser(data);
        setUsername(data.username || "");
        setRoll(data.roll || "");
        setSession(data.session || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to fetch user details.");
        if (err.response && err.response.status === 401) {
          logout();
          navigate("/login");
        }
      }
    };

    loadProfile();
  }, [navigate, logout]);

  // Handle image file preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleProfileUpdate = async () => {
    if (!username && !roll && !session && !imageFile) {
      return alert("Please update at least one field or upload an image.");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await updateProfile({ username, roll, session, imageFile });
      alert(res.message);

      // Update local state
      const updatedUser = { ...user };
      if (username) updatedUser.username = username;
      if (roll) updatedUser.roll = roll;
      if (session) updatedUser.session = session;
      if (res.profile_image) updatedUser.profile_image = res.profile_image;

      setUser(updatedUser);
      setImageFile(null);
      setPreviewImage(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}

      {user ? (
        <div className="profile-card">
          <div className="profile-image">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="profile-img" />
            ) : user.profile_image ? (
              <img
                src={`http://localhost:5010/uploads/${user.profile_image}`}
                alt="Profile"
                className="profile-img"
              />
            ) : (
              <FaUserCircle size={100} />
            )}
          </div>

          <div className="profile-details">
            <h1>{user.username || "Username"}</h1>
            <p>Email: {user.email}</p>
            <p>Roll: {user.roll || "N/A"}</p>
            <p>Session: {user.session || "N/A"}</p>
          </div>

          <div className="profile-actions">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="Roll"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
            />
            <input
              type="text"
              placeholder="Session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            />

            <input type="file" onChange={handleImageChange} />

            <button
              className="btn-edit"
              onClick={handleProfileUpdate}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default Profile;
