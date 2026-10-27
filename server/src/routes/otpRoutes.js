// routes/otpRoutes.js (Testing version - remove in production)
import express from "express";
import {
  getCompanyStats,
  getSmsBowerBalance,
} from "../controller/otpController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateAdminRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// admin routes
router.get(
  "/sms-balance",
  authMiddleware,
  validateAdminRole,
  getSmsBowerBalance,
);
router.get(
  "/company-stats",
  authMiddleware,
  validateAdminRole,
  getCompanyStats,
);

export default router;
