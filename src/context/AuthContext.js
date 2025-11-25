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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // -------------------------
  // Base URL for API
  // -------------------------
  const baseURL =
    process.env.REACT_APP_API_URL ||
    "https://gbc-dop-backend.onrender.com";

  // Unified token getter
  const getToken = () => localStorage.getItem("authToken");

  // Create an Axios instance with credentials enabled
  const api = axios.create({
    baseURL,
    withCredentials: true, // Important for CORS cookies (if used)
  });

  // -------------------------
  // Fetch Profile
  // -------------------------
  const fetchUserProfile = useCallback(
    async (token) => {
      if (!token) return;

      try {
        const response = await api.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserProfile(response.data);
        console.log("User profile fetched:", response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);

        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized - token may be expired.");
          logout();
        }
      }
    },
    [api]
  );

  // -------------------------
  // Check authentication
  // -------------------------
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
        "/api/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.token;
      localStorage.setItem("authToken", token);

      setIsAuthenticated(true);
      await fetchUserProfile(token);

      return true; // success
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);

      if (error.response) {
        throw new Error(
          error.response.data.message ||
            "Login failed. Please check your credentials."
        );
      } else {
        throw new Error("Network error. Check server and CORS settings.");
      }
    }
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // -------------------------
  // Upload profile picture
  // -------------------------
  const uploadProfilePicture = async (file) => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("image", file);

      if (!userProfile || !userProfile._id) throw new Error("User profile not found.");

      await api.post(`/api/user/${userProfile._id}/uploadProfileImage`, formData, {
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
      const formData = new FormData();

      if (profileImage) formData.append("profileImage", profileImage);

      const response = await api.put(`/api/user/${userData._id}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUserProfile(response.data.user);
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
