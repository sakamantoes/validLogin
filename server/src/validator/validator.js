import { validationResult } from "express-validator";

const validateData = (req, res, next) => {
  const errors = validationResult(req);
  let extractedErrors = {};
  if (errors.isEmpty()) {
    return next();
  }
  errors.array().forEach((err) => {
    extractedErrors[err.path] = err.msg;
  });

  return res.status(422).json({
    status: 422,
    success: false,
    error: extractedErrors,
    message: extractedErrors,
  });
};

export { validateData };
