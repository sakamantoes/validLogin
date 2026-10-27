import { rateLimit } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 requests per windowMs
  handler: (req, res, next, options) => {
    const customError = new Error("Too many requests, please try again later.");
    customError.status = 429; 
    next(customError); 
  },
  skipSuccessfulRequests: true, // Only count failed attempts
});
