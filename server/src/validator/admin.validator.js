import { body, check, param, query } from "express-validator";

export const updateDepositValidator = [
  body("status")
    .isIn(["pending", "failed", "success"])
    .withMessage("should be success, pending or either failed")
    .notEmpty(),
  ,
  check("id").isString().withMessage("id is missing in params").notEmpty(),
];

export const priceSettingSchema = [
  body("nariaRate").isString().withMessage("nariaRate is Required").notEmpty(),
  body("markupType")
    .isIn(["fixed", "percentage"])
    .withMessage("should be either fixed or percentage")
    .notEmpty(),
  body("markupValue")
    .isString()
    .withMessage("markupValue is Required")
    .notEmpty(),
];

export const customPriceSchema = [
  body("customPrice")
    .isNumeric()
    .notEmpty()
    .withMessage("customPrice should be a valid amount"),
];

export const accountSchema = [
  body("account_name")
    .isString()
    .notEmpty("account_name should be a non empty string"),
  body("account_number")
    .isString()
    .notEmpty("account_number should be a non empty string"),
  body("bank_name")
    .isString()
    .notEmpty("account_name should be a non empty string"),
];

export const updatePlatformLogSellingPriceSchema = [
  param("id").isMongoId().withMessage("id must be a valid log id"),
  body("sellingPrice")
    .exists()
    .withMessage("sellingPrice is required")
    .isFloat({ min: 0 })
    .withMessage("sellingPrice must be a valid non-negative number"),
];

export const getAllPlatformLogsSchema = [
  query("status")
    .optional()
    .isIn(["active", "inactive", "out_of_stock"])
    .withMessage("invalid status"),
  query("productType")
    .optional()
    .isIn(["account", "celeb_update", "working_picture"])
    .withMessage("invalid productType"),
  query("category").optional().isString().withMessage("category must be a string"),
  query("search").optional().isString().withMessage("search must be a string"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];
