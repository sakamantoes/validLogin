// Global Error Handling Middleware

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const message = statusCode !== 500 ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    error: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorHandler;
