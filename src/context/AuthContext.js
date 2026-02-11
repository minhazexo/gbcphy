import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5010/api";

  const getToken = () => localStorage.getItem("authToken");
  const getUserId = () => localStorage.getItem("userId");

  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  // -------------------------
  // Fetch user profile
  // -------------------------
  // -------------------------
// Fetch user profile
// -------------------------
const fetchUserProfile = useCallback(
  async () => {
    const token = getToken();
    if (!token) {
      console.error("No token found in localStorage!");
      return;
    }

    try {
      // Decode user ID from token or store it separately when logging in
      const userId = parseJwt(token)?.id;
      if (!userId) {
        console.error("User ID not found in token!");
        return;
      }

      const response = await api.get(`/user/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserProfile(response.data);
      console.log("User profile fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response && error.response.status === 401) {
        logout();
      }
    }
  },
  [api]
);

// -------------------------
// Helper: decode JWT (simple base64 decode)
// -------------------------
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (err) {
    console.error("Invalid JWT token:", err);
    return null;
  }
}


  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, [fetchUserProfile]);

  // -------------------------
  // LOGIN
  // -------------------------
  const login = async (email, password) => {
    try {
      const response = await api.post(
        "/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.token;
      const user = response.data.user;
      if (!token || !user) throw new Error("Invalid login response");

      localStorage.setItem("authToken", token);
      localStorage.setItem("userId", user.id); // store userId for profile calls
      setIsAuthenticated(true);
      await fetchUserProfile(token);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      if (error.response) {
        throw new Error(error.response.data.message || "Login failed. Check credentials.");
      } else {
        throw new Error("Network error. Check server and CORS settings.");
      }
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // -------------------------
  // Upload profile picture
  // -------------------------
  const uploadProfilePicture = async (file) => {
    try {
      const token = getToken();
      const userId = getUserId();
      if (!userProfile || !userId) throw new Error("User profile not found.");

      const formData = new FormData();
      formData.append("image", file);

      await api.post(`/user/${userId}/uploadProfileImage`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchUserProfile(token);
      console.log("Profile picture uploaded.");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  // -------------------------
  // Update user profile
  // -------------------------
  const updateUserProfile = async (userData, profileImage) => {
    try {
      const token = getToken();
      const userId = getUserId();
      const formData = new FormData();
      if (profileImage) formData.append("profileImage", profileImage);

      const response = await api.post(`/user/${userId}/editProfile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUserProfile(response.data.user || userProfile);
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

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
