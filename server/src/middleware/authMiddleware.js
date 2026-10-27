import { verifyToken } from "../utils/jwttoken.js";
import User from "../model/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      token = req.cookies.smsWinnerToken;
    }

    if (!token) {
      res.statusCode = 401;
      throw new Error("No Authorization token provided");
    }

    // Verify token
    const decoded = verifyToken(token);

    // if a user of our platform
    const findUser = await User.findOne({
      email: decoded.email,
    }).select("-password");

    if (!findUser) {
      res.statusCode = 401;
      throw new Error("unauthorize");
    }

    // Attach user info to request
    req.user = findUser;
    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Authentication required");
      res.statusCode = 401;
      return next(error);
    }

    if (!roles.includes(req.user.role)) {
      const error = new Error("You are not authorized to access this resource");
      res.statusCode = 403;
      return next(error);
    }

    next();
  };
};

const validateAdminRole = authorizeRoles("admin");
const validateUserRole = authorizeRoles("user");

export default authMiddleware;
export { authorizeRoles, validateAdminRole, validateUserRole };
