// routes/adminProfitRoutes.js

import express from 'express';
import {
  getAdminProfitConfig,
  updateAdminProfitConfig,
  toggleAdminProfit,
  setFixedProfit,
  setPercentageProfit,
  getPricePreview
} from '../controllers/adminProfitController.js';
import authMiddleware, { validateAdminRole } from '../middleware/authMiddleware.js';


const router = express.Router();

// All routes require authentication and admin role


// Get and update profit configuration
router.get('/config',authMiddleware, validateAdminRole, getAdminProfitConfig);
router.put('/config', authMiddleware, validateAdminRole, updateAdminProfitConfig);

// Toggle profit system
router.post('/toggle', authMiddleware, validateAdminRole, toggleAdminProfit);

// Set profit methods
router.post('/fixed', authMiddleware, validateAdminRole, setFixedProfit);
router.post('/percentage', authMiddleware, validateAdminRole, setPercentageProfit);

// Preview price calculation
router.get('/preview', authMiddleware, validateAdminRole, getPricePreview);

export default router;