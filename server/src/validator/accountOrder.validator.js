import { query } from "express-validator";

const accountOrderQueryRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
  query("status")
    .optional()
    .isIn(["pending", "processing", "completed", "failed", "cancelled"])
    .withMessage("invalid purchase status"),
  query("deliveryStatus")
    .optional()
    .isIn(["pending", "processing", "delivered", "failed"])
    .withMessage("invalid delivery status"),
  query("search")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("search must be a string of 100 characters or fewer"),
];

export const getAccountOrdersSchema = accountOrderQueryRules;
