import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // User authentication state
  const [userProfile, setUserProfile] = useState(null); // User profile state

  // Base URL for API requests
  const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Fetch user profile with token
  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await axios.get(`${baseURL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserProfile(response.data); // Store profile data
      console.log("User profile fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - token may be expired or invalid.");
        logout(); // Logout if token is invalid
      }
    }
  }, [baseURL]);

  // Check authentication state on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, [fetchUserProfile]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("authToken", response.data.token); // Store token
      setIsAuthenticated(true);
      fetchUserProfile(response.data.token); // Fetch profile after login
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      if (error.response) {
        throw new Error(
          error.response.data.message ||
          "Login failed. Please check your credentials."
        );
      }
    }
  };

  // Logout function
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("image", file);

      if (!userProfile || !userProfile._id) {
        throw new Error("User profile not found or not authenticated.");
      }

      await axios.post(
        `${baseURL}/api/user/${userProfile._id}/uploadProfileImage`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUserProfile(token); // Refresh profile after upload
      console.log("Profile picture uploaded successfully.");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  // Update user profile
  const updateUserProfile = async (userData, profileImage) => {
    try {
      const token = localStorage.getItem("authToken");

      // Delete old profile image if necessary
      if (userData.profileImageId) {
        await axios.delete(
          `${baseURL}/api/user/deleteFile/${userData.profileImageId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Old profile image deleted.");
      }

      // Update user profile
      const formData = new FormData();
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await axios.put(
        `${baseURL}/api/user/${userData._id}/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserProfile(response.data.user); // Update state
      console.log("Profile updated:", response.data.user);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userProfile,
        login,
        logout,
        uploadProfilePicture,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
