// src/api/middlewares/authorizeUserAccess.js
import { failure } from "../utilities/response.js";

/**
 * Middleware to authorize a user to access a resource they own.
 *
 * @param {"params"|"body"} location - where to read the target id (params or body)
 * @param {string} key - the key that contains the userId
 *
 * Usage in route:
 *   router.put(
 *     "/profile/:id",
 *     authMiddleware,
 *     authorizeUserAccess("params", "id"),
 *     updateProfileController
 *   );
 */
export const authorizeUserAccess = (location = "params", key = "id") => {
  return (req, res, next) => {
    try {
      const targetUserId = req[location]?.[key]; // id from URL or body
      const loggedInUserId = req.user?.id;       // id from JWT

      if (!targetUserId) {
        return res
          .status(400)
          .json(failure(`Missing target id in ${location}.${key}`));
      }

      if (!loggedInUserId) {
        return res
          .status(401)
          .json(failure("Unauthorized: user not authenticated"));
      }

      // Ownership check
      if (String(targetUserId) !== String(loggedInUserId)) {
        return res
          .status(403)
          .json(failure("Forbidden: you do not own this resource"));
      }

      next();
    } catch (err) {
      console.error("authorizeUserAccess error:", err);
      return res.status(500).json(failure("Authorization failed"));
    }
  };
};
