// Mock API responses for local-only operation
const API_BASE_URL = "/api";

// ---------- Auth headers (stubbed) ----------
const getAuthHeaders = () => {
  return {};
};

// ---------- Current user ID (stubbed) ----------
const getUserId = () => "guest-user";

// ---------- Auth API (stubbed) ----------
export const loginUser = async ({ email, password }) => {
  console.log("Mock login called with:", email);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    token: "mock-token",
    user: { id: "guest-user", username: "Guest User", email: email }
  };
};

export const registerUser = async ({ username, email, password }) => {
  console.log("Mock register called with:", username, email);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { message: "User registered successfully (Mock)" };
};

// ---------- User API (stubbed) ----------
export const fetchProfile = async () => {
  console.log("Mock fetchProfile called");
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: "guest-user",
    username: "Guest User",
    email: "guest@example.com",
    roll: "123456",
    session: "2023-24",
    profile_image: null
  };
};

export const updateProfile = async ({ username, roll, session, imageFile }) => {
  console.log("Mock updateProfile called");
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    message: "Profile updated successfully (Mock)",
    profile_image: null,
  };
};
