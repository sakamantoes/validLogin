import { body } from "express-validator";

 const validateLog = [
  body("email").isEmail().withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Invalid price"),

  body("country")
    .notEmpty()
    .withMessage("Country is required"),
];

export default validateLog;