import express from "express";
import { validateUser } from "../schema/user.schema.js";
import { toUserResponseDTO } from "../dto/user.dto.js";
import { success, failure } from "../utilities/response.js";

// Middlewares
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeUserAccess } from "../middlewares/authorizeUserAccess.js";

export const userRouter = (dependencies) => {
  const router = express.Router();
  const {
    registerUserUsecase,
    loginUserUsecase,
    updateUserUsecase,
    getUserUsecase,
    refreshTokenUsecase,
    logoutUsecase,
  } = dependencies.usecases;

  // REGISTER USER (PUBLIC)
  router.post("/register", validateUser, async (req, res) => {
    try {
      const data = await registerUserUsecase.registerUser(req.body);
      res.json(success("User created", toUserResponseDTO(data)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // LOGIN USER (PUBLIC)
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const { user, token } = await loginUserUsecase.loginUser(username, password);
      
      res.json(
        success("Login successful", {
          user: toUserResponseDTO(user),
          token, // { accessToken, refreshToken }
        })
      );
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // GET USER PROFILE (AUTH + OWNERSHIP)
  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const user = await getUserUsecase.getUser(req.params.id);
      res.json(success("User profile", toUserResponseDTO(user)));
    } catch (err) {
      res.status(404).json(failure(err.message));
    }
  });

  // UPDATE USER PROFILE (AUTH + OWNERSHIP)
  router.put(
    "/:id",
    authMiddleware,
    validateUser,
    async (req, res) => {
      try {
        const updatedUser = await updateUserUsecase.updateUser(req.params.id, req.body);
        res.json(success("User updated", toUserResponseDTO(updatedUser)));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  // REFRESH TOKEN (PUBLIC - refresh token required)
  router.post("/refresh-token", async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) return res.status(401).json(failure("Refresh token required"));

      // Delegate full refresh flow to the usecase (no DB or jwt logic here)
      const tokens = await refreshTokenUsecase.refreshToken(refreshToken);

      res.json(success("Token refreshed", tokens));
    } catch (err) {
      // map known errors to 403 for invalid/expired token, others 400
      const msg = err && err.message ? err.message : "Refresh failed";
      if (msg.includes("Invalid") || msg.includes("expired")) {
        return res.status(403).json(failure(msg));
      }
      return res.status(400).json(failure(msg));
    }
  });

  // LOGOUT USER (PUBLIC - refresh token required)
  router.post("/logout", async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) return res.status(401).json(failure("Refresh token required"));

      await logoutUsecase.logout(refreshToken);

      res.json(success("Logout successful", null));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  return router;
};
