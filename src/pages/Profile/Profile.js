import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import "../../styles/profile.scss";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUser(response.data); // Set user data from response
        } catch (error) {
          console.error("Error fetching profile:", error);
          setError("An error occurred while fetching your profile. Please try again.");
          if (error.response && error.response.status === 401) {
            logout(); // Logout if unauthorized
            navigate("/login");
          } else {
            setError("Failed to fetch user details.");
          }
        }
      } else {
        navigate("/login"); // Redirect to login if no token
      }
    };

    fetchData();
  }, [navigate, logout]);

  const handleEditProfile = () => {
    navigate("/editprofile");
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
            {user.profileImageId ? (
              <img
                src={`http://localhost:5000/api/user/${user._id}/profileImage`} // Updated URL for GridFS image retrieval
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
          </div>
          <div className="profile-actions">
            <button className="btn-edit" onClick={handleEditProfile}>
              Edit Profile
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
