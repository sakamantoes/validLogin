import jsonwebtoken from "jsonwebtoken";
import { env } from "../config/constant.js";

const generateToken = (payload) => {
  const token = jsonwebtoken.sign(payload, env.jwtSecret, {
    expiresIn: "7d",
  });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jsonwebtoken.verify(token, env.jwtSecret);
    return decoded;
  } catch (err) {
    throw new Error(err.message || "Invalid token");
  }
};

export { generateToken, verifyToken};
