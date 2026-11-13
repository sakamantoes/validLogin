import api from "./api.js";

export const initializeSquadPayment = async (data) => {
  const res = await api.post("/api/payment/squad/initialize-deposit", data);

  return res.data;
};

export const initializeQuestPayment = async (data) => {
  const res = await api.post("/api/payment/quest/initialize-deposit", data);

  return res.data;
};

export const initializeCtexPayment = async (data) => {
  const res = await api.post("/api/payment/ctex/initialize-deposit", data);

  return res.data;
};

export const getSquadPaymentStatus = async (data) => {
  const res = await api.post(`/api/payment/status`, data);

  return res.data;
};

// Backend (getPaymentStatus) expects { referenceId } and returns
// { success, message, data: { referenceId, status: "PENDING" | "SUCCESS" | "FAILED" } }
export const getCtexPaymentStatus = async (referenceId, { signal } = {}) => {
  const res = await api.post("/api/payment/status", { referenceId }, { signal });

  return res.data;
};

export const manualBankPayment = async (data) => {
  const res = await api.post("/api/payment/manual/initialize-deposit", data);

  return res.data;
};

export const getManualAccountDetails = async () => {
  const res = await api.get("/api/user/account");

  return res.data;
};

export const getAlluserPurchaseReceipt = async () => {
  const res = await api.get("/api/user/purchase/receipt");

  return res.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "Image upload failed");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
};