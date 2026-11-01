import axios from "axios";
import { env } from "../config/constant.js";

const just_verified_api = axios.create({
  baseURL: "https://server.justverifyboost.com/api/v2",
  headers: {
    Authorization: `Bearer ${env.just_verified_api_key}`,
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

export default just_verified_api;
