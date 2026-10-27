import api from "./api";

// user

// Create new support message
export const createSupportMessage = async (data) => {
  const res = await api.post("/api/support/create", data);
  return res.data;
};

// Get user's own support messages
export const getUserSupportMessages = async () => {
  const res = await api.get("/api/support/my-messages");
  return res.data;
};

// Get single support message by ID
export const getSupportMessageById = async (id) => {
  const res = await api.get(`/api/support/my-messages/${id}`);
  return res.data;
};

// Add reply from user
export const addUserReply = async (id, message) => {
  const res = await api.put(`/api/support/my-messages/${id}/reply`, { message });
  return res.data;
};

// Delete user's own support message
export const deleteUserSupportMessage = async (id) => {
  const res = await api.delete(`/api/support/my-messages/${id}`);
  return res.data;
};

// admin

// Get all support messages (admin)
export const getAllSupportMessages = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/api/support/admin/all${query ? `?${query}` : ""}`);
  return res.data;
};

// Get single support message (admin)
export const getAdminSupportMessageById = async (id) => {
  const res = await api.get(`/api/support/admin/${id}`);
  return res.data;
};

// Admin reply to support message
export const adminReplyToMessage = async (id, reply) => {
  const res = await api.post(`/api/support/admin/${id}/reply`, { reply });
  return res.data;
};

// Update support message status (admin)
export const updateSupportStatus = async (id, status) => {
  const res = await api.put(`/api/support/admin/${id}/status`, { status });
  return res.data;
};

// Delete support message (admin)
export const deleteSupportMessage = async (id) => {
  const res = await api.delete(`/api/support/admin/${id}`);
  return res.data;
};

// Get unread count for admin dashboard
export const getUnreadSupportCount = async () => {
  const res = await api.get("/api/support/admin/unread/count");
  return res.data;
};