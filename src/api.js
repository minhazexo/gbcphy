import axios from "axios";

// Use relative path to backend for proxy
const API_BASE_URL = "/api";

// ---------- Auth headers ----------
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------- Current user ID ----------
const getUserId = () => localStorage.getItem("userId");

// ---------- Auth API ----------
export const loginUser = async ({ email, password }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    if (res.data.token) localStorage.setItem("authToken", res.data.token);
    if (res.data.user) localStorage.setItem("userId", res.data.user.id);
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login failed");
  }
};

export const registerUser = async ({ username, email, password }) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
    return res.data;
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      (err.response?.data?.errors
        ? err.response.data.errors.map((e) => e.msg).join(", ")
        : "Registration failed");
    throw new Error(msg);
  }
};

// ---------- User API ----------
export const fetchProfile = async () => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const res = await axios.get(`${API_BASE_URL}/user/${userId}/profile`, {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to fetch profile");
  }
};

export const updateProfile = async ({ username, roll, session, imageFile }) => {
  try {
    const userId = getUserId();
    if (!userId) throw new Error("User not logged in");

    const formData = new FormData();
    if (username) formData.append("username", username);
    if (roll) formData.append("roll", roll);
    if (session) formData.append("session", session);
    if (imageFile) formData.append("image", imageFile);

    const res = await axios.post(`${API_BASE_URL}/user/${userId}/editProfile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders(),
      },
    });

    return {
      message: res.data.message,
      profile_image: res.data.profile_image || null,
    };
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to update profile");
  }
};
