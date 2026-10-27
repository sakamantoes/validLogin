import { Router } from "express";
import {
  priceSettingController,
  getPlatformDeposits,
  getUserWaitingForOtp,
  getAllOtpOrders,
  updateDepositsStatus,
  getAdminServices,
  getAdminServiceGroups,
  getServicesAvailableName,
  updateServiceActiveStatus,
  updateServiceCustomPrice,
  updateServiceVisibility,
  getSmsPoolBalance,
  setManualAccountDetails,
  getManualAccountDetails,
  adminLogin,
} from "../controller/admin.controller.js";
import authMiddleware, {
  validateAdminRole,
} from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import {
  updateDepositValidator,
  priceSettingSchema,
  customPriceSchema,
  accountSchema,
} from "../validator/admin.validator.js";
import { validateData } from "../validator/validator.js";
import { editUserWallet } from "../controller/auth.js";

const router = Router();

router.post("/login", loginLimiter, adminLogin);

router.post("/deposit", authMiddleware, validateAdminRole, getPlatformDeposits);

router.patch(
  "/deposit/:id",
  authMiddleware,
  validateAdminRole,
  updateDepositValidator,
  validateData,
  updateDepositsStatus,
);
router.post(
  "/pricing/setting",
  authMiddleware,
  validateAdminRole,
  priceSettingSchema,
  validateData,
  priceSettingController,
);

router.get(
  "/pending/otp",
  authMiddleware,
  validateAdminRole,
  getUserWaitingForOtp,
);

router.get("/otp/orders", authMiddleware, validateAdminRole, getAllOtpOrders);

router.get(
  "/all/platform/services",
  authMiddleware,
  validateAdminRole,
  getAdminServices,
);

router.get(
  "/all/platform/service-name",
  authMiddleware,
  validateAdminRole,
  getServicesAvailableName,
);

router.get(
  "/all/platform/service-groups",
  authMiddleware,
  validateAdminRole,
  getAdminServiceGroups,
);

router.patch(
  "/platform/service/:service/active",
  authMiddleware,
  validateAdminRole,
  updateServiceActiveStatus,
);

router.patch(
  "/platform/service/:id/custom-price",
  authMiddleware,
  validateAdminRole,
  customPriceSchema,
  validateData,
  updateServiceCustomPrice,
);

router.patch(
  "/platform/service/:id/visibility",
  authMiddleware,
  validateAdminRole,
  updateServiceVisibility,
);

router.get(
  "/smspool/balance",
  authMiddleware,
  validateAdminRole,
  getSmsPoolBalance,
);

router.put("/:id/wallet", authMiddleware, validateAdminRole, editUserWallet);

router.patch(
  "/account",
  authMiddleware,
  validateAdminRole,
  accountSchema,
  validateData,
  setManualAccountDetails,
);

router.get(
  "/account",
  authMiddleware,
  validateAdminRole,
  getManualAccountDetails,
);

export default router;
