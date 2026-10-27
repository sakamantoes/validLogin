import express from "express";
import {
  createSupportMessage,
  getUserSupportMessages,
  getSupportMessageById,
  addUserReply,
  deleteUserSupportMessage,
  getAllSupportMessages,
  getAdminSupportMessageById,
  adminReply,
  updateSupportStatus,
  deleteSupportMessage,
  getUnreadCount,
} from "../controller/supportController.js";
import authMiddleware, { validateAdminRole } from "../middleware/authMiddleware.js";


const router = express.Router();

// User routes
router.post("/create", authMiddleware, createSupportMessage);
router.get("/my-messages", authMiddleware, getUserSupportMessages);
router.get("/my-messages/:id", authMiddleware, getSupportMessageById);
router.put("/my-messages/:id/reply", authMiddleware, addUserReply);
router.delete("/my-messages/:id", authMiddleware, deleteUserSupportMessage);

// Admin routes
router.get("/admin/all", authMiddleware, validateAdminRole, getAllSupportMessages);
router.get("/admin/:id", authMiddleware, validateAdminRole, getAdminSupportMessageById);
router.post("/admin/:id/reply", authMiddleware, validateAdminRole, adminReply);
router.put("/admin/:id/status", authMiddleware, validateAdminRole, updateSupportStatus);
router.delete("/admin/:id", authMiddleware, validateAdminRole, deleteSupportMessage);
router.get("/admin/unread/count", authMiddleware, validateAdminRole, getUnreadCount);

export default router;