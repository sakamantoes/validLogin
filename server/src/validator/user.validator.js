import { body } from "express-validator";

export const buyNumberServiceSchema = [
  body("service").isString().withMessage("service is required").notEmpty(),
  body("country").isString().withMessage("country is required").notEmpty(),
];

export const buyActiveLogSchema = [
  body("logId").isMongoId().withMessage("logId must be a valid log id"),
  body("quantity")
    .toInt()
    .isInt({ min: 1 })
    .withMessage("quantity must be a positive integer"),
];
