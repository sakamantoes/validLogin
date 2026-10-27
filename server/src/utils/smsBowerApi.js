// utils/smsBowerApi.js

import axios from "axios";
import { env } from "../config/constant.js";

const BaseUrl = env.smsBowerBaseUrl;
const API_KEY = env.smsBowerApiKey;

const smsBowerApi = axios.create({
  baseURL: BaseUrl || "https://smsbower.page",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  params: {
    api_key: API_KEY,
  },
});

// Response interceptor for logging
smsBowerApi.interceptors.response.use(
  (response) => {
    console.log(
      `SMSBower API [${response.config.method?.toUpperCase()}]: ${response.config.url} - Status: ${response.status}`
    );

    return response;
  },
  (error) => {
    console.error("SMSBower API Error:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default smsBowerApi;