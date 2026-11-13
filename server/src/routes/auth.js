import { Router } from "express";
import {
  activateUser,
  deactivateUser,
  emailLogin,
  emailSignup,
  getAllUser,
  getAuthUser,
  googleSetup,
  googleVerified,
  updatePassword,
  updateUsername,
  updatePhone,
  forgotPassword,
  resetPassword,
  logout,
} from "../controller/auth.js";
import authMiddleware, {
  validateAdminRole,
} from "../middleware/authMiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { validateData } from "../validator/validator.js";
import {
  googleSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validator/auth.validator.js";
import { verifyInternalSecret } from "../middleware/verifyInternalSecret.js";

const router = Router();

router.post("/signup", loginLimiter, registerSchema, validateData, emailSignup);
router.post("/login", loginLimiter, loginSchema, validateData, emailLogin);
router.post("/google", loginLimiter, googleSchema, validateData, googleSetup);
router.post("/google-verified", verifyInternalSecret, googleVerified);
router.post("/logout", logout);
router.get("/me", authMiddleware, getAuthUser);
router.get("/allUsers", authMiddleware, validateAdminRole, getAllUser);
router.put("/activate/:id", authMiddleware, validateAdminRole, activateUser);
router.put(
  "/deactivate/:id",
  authMiddleware,
  validateAdminRole,
  deactivateUser,
);
router.put("/update-username", authMiddleware, updateUsername);
router.put("/update-password", authMiddleware, updatePassword);

// Used by the PhoneRequiredModal when a user without a phone attempts
// a C-TEX deposit. Saves the phone and resets ctexPhoneSynced so the
// next deposit PATCHes the existing C-TEX customer instead of reusing it.
router.patch("/phone", authMiddleware, updatePhone);

router.post(
  "/forgot/password",
  loginLimiter,
  forgotPasswordSchema,
  validateData,
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  loginLimiter,
  resetPasswordSchema,
  validateData,
  resetPassword,
);

export default router;