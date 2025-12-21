// src/API/middlewares/auth.middleware.js
import { failure } from "../utilities/response.js";
import { jwtService } from "../../infrastructure/service/jwt_service.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(failure("Authorization header missing or malformed"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = await jwtService.verifyAccessToken(token);

    // Include role from JWT so roleMiddleware works
    req.user = {
      id: decoded.userId ?? decoded.id,
      username: decoded.username ?? decoded.userName ?? decoded.name,
      email: decoded.email,
      role: decoded.role ?? "user", // default to "user"
    };

    next();
  } catch (err) {
    return res.status(401).json(failure("Invalid or expired token"));
  }
};
