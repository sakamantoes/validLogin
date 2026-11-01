import { Router } from "express";
import {
  buyActiveLogs,
  getAllAccountOrders,
  getAllPlatformLogs,
  getActivePlatformLogs,
  getMyAccountOrders,
  // logWebhook,
  updatePlatformLogSellingPrice,
} from "../controller/logs.controller.js";
import authMiddleware, {
  validateAdminRole,
  validateUserRole,
} from "../middleware/authMiddleware.js";
import {
  getAllPlatformLogsSchema,
  updatePlatformLogSellingPriceSchema,
} from "../validator/admin.validator.js";
import { buyActiveLogSchema } from "../validator/user.validator.js";
import { getAccountOrdersSchema } from "../validator/accountOrder.validator.js";
import { validateData } from "../validator/validator.js";

const router = Router();
// router.post("/webhook", logWebhook);

router.get(
  "/orders/me",
  authMiddleware,
  validateUserRole,
  getAccountOrdersSchema,
  validateData,
  getMyAccountOrders,
);
router.get(
  "/orders",
  authMiddleware,
  validateAdminRole,
  getAccountOrdersSchema,
  validateData,
  getAllAccountOrders,
);

// admin endpoints
router.get(
  "/",
  authMiddleware,
  validateAdminRole,
  getAllPlatformLogsSchema,
  validateData,
  getAllPlatformLogs,
);
router.patch(
  "/:id/price",
  authMiddleware,
  validateAdminRole,
  updatePlatformLogSellingPriceSchema,
  validateData,
  updatePlatformLogSellingPrice,
);

// user enpoints
router.get("/active", authMiddleware, validateUserRole, getActivePlatformLogs);
router.post(
  "/active/buy",
  authMiddleware,
  validateUserRole,
  buyActiveLogSchema,
  validateData,
  buyActiveLogs,
);


export default router;
