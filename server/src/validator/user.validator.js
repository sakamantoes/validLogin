import { body } from "express-validator";

export const buyNumberServiceSchema = [
  body("service").isString().withMessage("service is required").notEmpty(),
  body("country").isString().withMessage("country is required").notEmpty(),
];
