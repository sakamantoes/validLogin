import { Router } from "express";
import authMiddleware, {
  validateUserRole,
} from "../middleware/authMiddleware.js";
import {
  getAllUserDeposit,
  getPurchaseHistory,
  getUserOtpOrders,
  checkUserOtpOrderStatus,
  getUserWalletBalance,
  getPlatformServices,
  getServicesAvailableName,
  buyNumberService,
  cancelOtpAndRefund,
} from "../controller/user.controller.js";
import { buyNumberServiceSchema } from "../validator/user.validator.js";
import { validateData } from "../validator/validator.js";
import { getManualAccountDetails } from "../controller/admin.controller.js";

const router = Router();

router.get(
  "/wallet/balance",
  authMiddleware,
  validateUserRole,
  getUserWalletBalance,
);

router.get(
  "/wallet/deposits",
  authMiddleware,
  validateUserRole,
  getAllUserDeposit,
);

router.get(
  "/purchase/receipt",
  authMiddleware,
  validateUserRole,
  getPurchaseHistory,
);

router.get("/otp/orders", authMiddleware, validateUserRole, getUserOtpOrders);

router.get(
  "/otp/status/:orderId",
  authMiddleware,
  validateUserRole,
  checkUserOtpOrderStatus,
);

router.post(
  "/buy/services",
  authMiddleware,
  validateUserRole,
  buyNumberServiceSchema,
  validateData,
  buyNumberService,
);

router.post(
  "/otp/cancel/:orderId",
  authMiddleware,
  validateUserRole,
  cancelOtpAndRefund,
);

router.get("/platform/services", authMiddleware, getPlatformServices);

router.get(
  "/platform/countries",
  authMiddleware,
  getServicesAvailableName,
);

router.get(
  "/account",
  authMiddleware,
  validateUserRole,
  getManualAccountDetails,
);

export default router;
