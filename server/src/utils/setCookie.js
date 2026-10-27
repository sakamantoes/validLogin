import { env } from "../config/constant.js";

const isProduction = env.node_env === "production";

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const setAuthCookie = (res, token) => {
  res.cookie("smsWinnerToken", token, {
    ...authCookieOptions,
  });
};
