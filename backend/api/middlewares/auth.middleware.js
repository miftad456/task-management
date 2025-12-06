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

    // keep a consistent shape expected by routes/usecases
    req.user = {
      id: decoded.userId ?? decoded.id,
      username: decoded.username ?? decoded.userName ?? decoded.name,
      email: decoded.email,
    };

    next();
  } catch (err) {
    return res.status(401).json(failure("Invalid or expired token"));
  }
};
