import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const getToken = () => localStorage.getItem("authToken");
  const getUserId = () => localStorage.getItem("userId");

  const fetchUserProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      return;
    }

    // Mock profile data
    const mockProfile = {
      id: "guest-user",
      username: "Guest User",
      email: "guest@example.com",
      roll: "123456",
      session: "2023-24",
      profile_image: null
    };

    setUserProfile(mockProfile);
    console.log("Mock user profile loaded");
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile();
    }
  }, [fetchUserProfile]);

  // -------------------------
  // LOGIN (Stubbed)
  // -------------------------
  const login = async (email, password) => {
    console.log("Mock login attempt for:", email);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    localStorage.setItem("authToken", "mock-token");
    localStorage.setItem("userId", "guest-user");
    setIsAuthenticated(true);
    await fetchUserProfile();

    return true;
  };

  // -------------------------
  // LOGOUT (Stubbed)
  // -------------------------
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  // -------------------------
  // Upload profile picture (Stubbed)
  // -------------------------
  const uploadProfilePicture = async (file) => {
    console.log("Mock uploadProfilePicture called");
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Profile picture uploaded (Mock).");
  };

  // -------------------------
  // Update user profile (Stubbed)
  // -------------------------
  const updateUserProfile = async (userData, profileImage) => {
    console.log("Mock updateUserProfile called");
    await new Promise(resolve => setTimeout(resolve, 500));
    setUserProfile(prev => ({ ...prev, ...userData }));
    console.log("Profile updated (Mock).");
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

// Helper to get just user property
export const useUser = () => {
  const { userProfile } = useContext(AuthContext);
  return userProfile;
};
