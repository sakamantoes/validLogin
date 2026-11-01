import api from "./api.js";

export const getAdminPlatformLogs = async (params = {}) => {
  const res = await api.get("/api/logs", { params });
  return res.data;
};

export const updateAdminPlatformLogPrice = async (id, sellingPrice) => {
  const res = await api.patch(`/api/logs/${id}/price`, { sellingPrice });
  return res.data;
};

export const getActivePlatformLogs = async (params = {}) => {
  const res = await api.get("/api/logs/active", { params });
  return res.data;
};

export const buyActivePlatformLog = async (payload) => {
  const res = await api.post("/api/logs/active/buy", payload);
  return res.data;
};

export const getMyAccountOrders = async (params = {}) => {
  const res = await api.get("/api/logs/orders/me", { params });
  return res.data;
};

export const getAdminAccountOrders = async (params = {}) => {
  const res = await api.get("/api/logs/orders", { params });
  return res.data;
};
