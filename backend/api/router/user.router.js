import express from "express";
import { validateUser } from "../schema/user.schema.js";
import { toUserResponseDTO } from "../dto/user.dto.js";
import { success, failure } from "../utilities/response.js";
import { upload } from "../middlewares/upload.middleware.js";

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
    updateProfileUsecase,
    getProfileUsecase,
  } = dependencies.usecases;

  /**
   * @swagger
   * /users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserInput'
   *     responses:
   *       200:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/UserResponse'
   *       400:
   *         description: Validation error or user already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  router.post("/register", validateUser, async (req, res) => {
    try {
      const data = await registerUserUsecase.registerUser(req.body);
      res.json(success("User created", toUserResponseDTO(data)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /users/login:
   *   post:
   *     summary: Login user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/LoginResponse'
   *       400:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
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

  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     summary: Get user profile by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User profile retrieved
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/UserResponse'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: User not found
   */
  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const user = await getUserUsecase.getUser(req.params.id);
      res.json(success("User profile", toUserResponseDTO(user)));
    } catch (err) {
      res.status(404).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     summary: Update user profile
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserInput'
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               allOf:
   *                 - $ref: '#/components/schemas/SuccessResponse'
   *                 - type: object
   *                   properties:
   *                     data:
   *                       $ref: '#/components/schemas/UserResponse'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   */
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

  /**
   * @swagger
   * /users/refresh-token:
   *   post:
   *     summary: Refresh access token
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Refresh token from login
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     accessToken:
   *                       type: string
   *                     refreshToken:
   *                       type: string
   *       401:
   *         description: Refresh token required
   *       403:
   *         description: Invalid or expired refresh token
   */
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

  /**
   * @swagger
   * /users/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - refreshToken
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 description: Refresh token to revoke
   *     responses:
   *       200:
   *         description: Logout successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SuccessResponse'
   *       400:
   *         description: Invalid refresh token
   *       401:
   *         description: Refresh token required
   */
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

  /**
   * GET /users/profile/:id
   * Get public profile of a user
   */
  router.get("/profile/:id", authMiddleware, async (req, res) => {
    try {
      const profile = await getProfileUsecase.execute(req.params.id);
      res.json(success("User profile fetched", profile));
    } catch (err) {
      res.status(404).json(failure(err.message));
    }
  });

  /**
   * PUT /users/profile
   * Update current user's profile (including picture)
   */
  router.put("/profile/update", authMiddleware, async (req, res) => {
    try {
      const updatedUser = await updateProfileUsecase.execute(req.user.id, req.body);
      res.json(success("Profile updated", toUserResponseDTO(updatedUser)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * POST /users/profile/picture
   * Upload profile picture
   */
  router.post("/profile/picture", authMiddleware, upload.single("picture"), async (req, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const profilePicture = req.file.path;
      const updatedUser = await updateProfileUsecase.execute(req.user.id, { profilePicture });
      res.json(success("Profile picture updated", toUserResponseDTO(updatedUser)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  return router;
};
