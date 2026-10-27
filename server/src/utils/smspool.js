import axios from "axios";
import { env } from "../config/constant.js";

const toFormData = (payload) => {
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;

  if (!payload || isFormData) {
    return payload;
  }

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
};

const smspool_api = axios.create({
  baseURL: "https://api.smspool.net",
  headers: {
    Authorization: `Bearer ${env.sms_pool_api_key}`,
  },
});

smspool_api.interceptors.request.use((config) => {
  config.data = toFormData(config.data);
  return config;
});

export default smspool_api;
