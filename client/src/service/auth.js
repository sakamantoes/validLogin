import api from "./api.js";

// Original Google auth using axios
export const googleAuth = async (token) => {
  const res = await api.post("api/auth/google", { token });
  return res;
};

// New Google auth for Vercel integration
export const googleAuthVercel = async (token) => {
  const VERCEL_BASE = import.meta.env.VITE_VERCEL_URL; // e.g. https://your-app.vercel.app
  
  const response = await fetch(`${VERCEL_BASE}/api/google-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Google auth failed");
    error.response = { data, status: response.status };
    throw error;
  }

  // Return in same shape your existing code expects
  return { status: response.status, data };
};

export const getAuthUser = async () => {
  const res = await api.get("api/auth/me");
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("api/auth/login", data);
  return res.data;
};

export const signup = async (data) => {
  const res = await api.post("api/auth/signup", data);
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await api.post("api/auth/forgot/password", data);
  return res.data;
};

export const resetPassword = async (token, data) => {
  const res = await api.post(`api/auth/reset-password/${token}`, data);
  return res.data;
};

export const logout = async () => {
  const res = await api.post("api/auth/logout");
  return res.data;
};

export const VerifyCallback = async (data) => {
  const res = await api.post("api/payment/callback", data);
  return res.data;
};

export const getAllUsers = async () => {
  const res = await api.get("/api/auth/allUsers");
  return res.data;
};

export const activateUser = async (id) => {
  const res = await api.put(`/api/auth/activate/${id}`);
  return res.data;
};

export const deactivateUser = async (id) => {
  const res = await api.put(`/api/auth/deactivate/${id}`);
  return res.data;
};