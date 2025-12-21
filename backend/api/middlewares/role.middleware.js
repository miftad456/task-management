import { failure } from "../utilities/response.js";

export const roleMiddleware = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json(failure("Access denied: No user role found"));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json(failure("Access denied: Insufficient permissions"));
      }

      next();
    } catch (err) {
      return res.status(500).json(failure("Role validation failed"));
    }
  };
};
