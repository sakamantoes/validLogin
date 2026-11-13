import { Router } from "express";
import { validateData } from "../validator/validator.js";
import {
  initialiseDeposit,
  callbackUrlHandler,
  getPaymentStatus,
  initializeManualPayment,
  webhookHandler,
  initializeQuestPayment,
  questWebhook,
  initializeCtexPayment,
  ctexWebhook,
} from "../controller/payment.js";
import {
  initialiseDepositValidator,
  callbackUrlValidator,
  paymentStatusValidator,
  manualPaymentValidator,
} from "../validator/payment.validator.js";
import authMiddleware, {
  validateUserRole,
} from "../middleware/authMiddleware.js";

const router = Router();

/* =========================================================
 * SQUAD
 * ======================================================= */

router.post(
  "/squad/initialize-deposit",
  authMiddleware,
  validateUserRole,
  initialiseDepositValidator,
  validateData,
  initialiseDeposit
);

/* =========================================================
 * MANUAL
 * ======================================================= */

router.post(
  "/manual/initialize-deposit",
  authMiddleware,
  validateUserRole,
  manualPaymentValidator,
  validateData,
  initializeManualPayment
);

/* =========================================================
 * QUEST
 * ======================================================= */

router.post(
  "/quest/initialize-deposit",
  authMiddleware,
  validateUserRole,
  initialiseDepositValidator,
  validateData,
  initializeQuestPayment
);

/* =========================================================
 * C-TEX PAY (new)
 * =======================================================
 * Follows the same pattern as the other providers:
 *   - auth + role check on the initialize route
 *   - the same Zod validator (amount) is reused
 *   - webhook route is public (C-TEX authenticates via signature)
 * ======================================================= */

router.post(
  "/ctex/initialize-deposit",
  authMiddleware,
  validateUserRole,
  initialiseDepositValidator,
  validateData,
  initializeCtexPayment
);

router.post("/ctex/webhook", ctexWebhook);

/* =========================================================
 * SHARED (callback + status)
 * ======================================================= */

router.post(
  "/callback",
  callbackUrlValidator,
  validateData,
  callbackUrlHandler
);

router.post("/status", paymentStatusValidator, validateData, getPaymentStatus);

/* =========================================================
 * WEBHOOKS (public, provider-signed)
 * ======================================================= */

router.post("/webhook", webhookHandler);
router.post("/quest/webhook", questWebhook);

export default router;