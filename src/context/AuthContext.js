import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios"; // Ensure axios is imported to make HTTP requests

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State for user authentication status
  const [userProfile, setUserProfile] = useState(null); // State for storing user profile data

  const fetchUserProfile = useCallback(async (token) => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserProfile(response.data); // Set the user profile data in state
      console.log("User profile fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized - token might be expired or invalid.");
        logout(); // Logout if unauthorized
      } else {
        console.error("Network error or unexpected error occurred:", error);
        logout(); // Logout for other errors
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true); // Set authentication state to true
      fetchUserProfile(token); // Fetch the user profile with the token
    }
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      localStorage.setItem("authToken", response.data.token); // Store the token in localStorage
      setIsAuthenticated(true); // Update authentication state
      fetchUserProfile(response.data.token); // Fetch user profile after login
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

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken"); // Remove the token from localStorage
    setIsAuthenticated(false); // Update authentication state
    setUserProfile(null); // Clear user profile
  };

  const uploadProfilePicture = async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("image", file);

      if (!userProfile || !userProfile._id) {
        throw new Error("User profile not found or not authenticated.");
      }

      await axios.post(
        `http://localhost:5000/api/user/${userProfile._id}/uploadprofileImage`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUserProfile(token); // Re-fetch updated profile
      console.log("Profile picture uploaded successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      // Logout if there's an error during upload
    }
  };

  const updateUserProfile = async (userData, profileImage) => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Token retrieved:", token);

      // Check if there's an existing profile image to delete
      if (userData.profileImageId) {
        console.log("Deleting profile image with ID:", userData.profileImageId);
        const deleteResponse = await axios.delete(
          `http://localhost:5000/api/user/deleteFile/${userData.profileImageId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (deleteResponse.status !== 200) {
          console.error("Failed to delete old profile image");
          return; // Exit if deletion fails
        }
      }

      // Proceed to update the user profile
      const formData = new FormData();
      if (profileImage) {
        formData.append("profileImage", profileImage);
        console.log("Uploading new profile image:", profileImage);
      }

      const response = await axios.put(
        `http://localhost:5000/api/user/${userData._id}/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Upload response:", response.data);
      setUserProfile(response.data.user);
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
