import { env } from "../config/constant.js";

// middleware/verifyInternalSecret.js
export const verifyInternalSecret = (req, res, next) => {
  const secret = req.headers["x-internal-secret"];

  if (!secret || secret !== env.internal_api_secret) {
    res.statusCode = 403;
    return next(new Error("Forbidden: invalid internal secret"));
  }

  next();
};