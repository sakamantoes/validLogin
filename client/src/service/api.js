import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * intercept user reguest providing their token expires in an
 * authenticated screen and navigate them back to their login page
 */

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("smswinner_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/");

    if (error.response?.status === 401 && !isAuthRequest) {
      window.location.href = "/login";
    }

    console.log("global error:", error);
    return Promise.reject(error);
  },
);

export default api;
