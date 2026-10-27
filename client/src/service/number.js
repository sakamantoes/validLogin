// services/number.js

import api from "./api";

// ================= COUNTRIES =================
export const getAllCountry = async () => {
  const res = await api.get("/api/otp/countrys");
  return res.data;
};

// ================= SERVICES =================
export const getAvailableServices = async (params = {}) => {
  const res = await api.get("/api/user/platform/services", { params });
  return res.data;
};

export const getAvailableCountries = async () => {
  const res = await api.get("/api/user/platform/countries");
  return res.data;
};

// ================= BUY NUMBER =================
export const buyNumber = async (payload) => {
  const res = await api.post("/api/user/buy/services", payload);

  return res.data;
};

// ================= CHECK OTP =================
export const checkOtpStatus = async (orderId) => {
  const res = await api.get(`/api/user/otp/status/${orderId}`);

  return res.data;
};

// ================= CANCEL ACTIVATION =================
export const cancelActivation = async (orderId) => {
  const res = await api.post(`/api/user/otp/cancel/${orderId}`);

  return res.data;
};

// ================= ORDER HISTORY =================
export const getMyOrders = async (params = {}) => {
  const res = await api.get("/api/user/otp/orders", { params });

  return res.data;
};

// ================= USER BALANCE =================
export const getUserBalance = async () => {
  const res = await api.get("/api/otp/my-balance");

  return res.data;
};

// ================= ORDER DETAILS =================
export const getOrderDetails = async (orderId) => {
  const res = await api.get(`/api/otp/order/${orderId}`);

  return res.data;
};

// ================= SMSBOWER BALANCE =================
export const getSmsBowerBalance = async () => {
  const res = await api.get("/api/otp/sms-balance");

  return res.data;
};
