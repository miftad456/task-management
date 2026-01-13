// backend/api/router/team.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";
import { authorizeTeamManager } from "../middlewares/teamAccess.middleware.js";
import { toTeamResponseDTO } from "../dto/team.dto.js";
import { upload } from "../middlewares/upload.middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Teams
 *     description: Team collaboration and management
 */

export const teamRouter = (dependencies) => {
  const router = express.Router();

  const {
    teamUsecase,
    teamProfileUsecase,
    updateTeamProfileUsecase
  } = dependencies.usecases;

  /**
   * @swagger
   * /teams:
   *   post:
   *     summary: Create a new team
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [name]
   *             properties:
   *               name:
   *                 type: string
   *     responses:
   *       201:
   *         description: Team created
   *       400:
   *         description: Validation error
   */
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { name } = req.body;
      const managerId = req.user.id;
      const team = await teamUsecase.createTeam(name, managerId);
      res.status(201).json(success("Team created", toTeamResponseDTO(team, req.user.id)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/{teamId}/member:
   *   post:
   *     summary: Add member to team
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Member added
   */
  router.post("/:teamId/member", authMiddleware, authorizeTeamManager(teamUsecase), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { username, userId } = req.body;
      const identifier = userId || username;
      if (!identifier) return res.status(400).json(failure("username or userId is required"));
      const { team: updatedTeam, addedUser } = await teamUsecase.addMember(teamId, identifier);
      res.json(success("Member added", { username: addedUser.username, team: toTeamResponseDTO(updatedTeam, req.user.id) }));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/{teamId}/member:
   *   delete:
   *     summary: Remove member from team
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               userId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Member removed
   */
  router.delete("/:teamId/member", authMiddleware, authorizeTeamManager(teamUsecase), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { username, userId } = req.body;
      const identifier = userId || username;
      const { team: updatedTeam, removedUser } = await teamUsecase.removeMember(teamId, identifier);
      res.json(success("Member removed", { username: removedUser.username, team: toTeamResponseDTO(updatedTeam, req.user.id) }));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/manager/all:
   *   get:
   *     summary: Get all teams managed by user
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Teams retrieved
   */
  router.get("/manager/all", authMiddleware, async (req, res) => {
    try {
      const teams = await teamUsecase.getTeamsByManager(req.user.id);
      res.json(success("Teams fetched", teams.map(t => toTeamResponseDTO(t, req.user.id))));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/manager/stats:
   *   get:
   *     summary: Get manager statistics (teams count, total members)
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Stats retrieved
   */
  router.get("/manager/stats", authMiddleware, async (req, res) => {
    try {
      const stats = await teamUsecase.getManagerStats(req.user.id);
      res.json(success("Stats fetched", stats));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/member/all:
   *   get:
   *     summary: Get all teams where user is a member
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Teams retrieved
   */
  router.get("/member/all", authMiddleware, async (req, res) => {
    try {
      const teams = await teamUsecase.getTeamsByMember(req.user.id);
      res.json(success("Teams fetched", teams.map(t => toTeamResponseDTO(t, req.user.id))));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/{teamId}/leave:
   *   delete:
   *     summary: Request to leave team
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Leave request submitted
   */
  router.delete("/:teamId/leave", authMiddleware, async (req, res) => {
    try {
      const request = await teamUsecase.requestLeave(req.params.teamId, req.user.id);
      res.json(success("Leave request submitted", request));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });
  /**
   * @swagger
   * /teams/{teamId}:
   *   get:
   *     summary: Get team by ID
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Team retrieved
   */
  router.get("/:teamId", authMiddleware, async (req, res) => {
    try {
      const team = await teamUsecase.getTeamById(req.params.teamId);
      res.json(success("Team fetched", toTeamResponseDTO(team, req.user.id)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/{teamId}:
   *   delete:
   *     summary: Delete team (manager only)
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Team deleted
   */
  router.delete("/:teamId", authMiddleware, authorizeTeamManager(teamUsecase), async (req, res) => {
    try {
      await teamUsecase.deleteTeam(req.params.teamId, req.user.id);
      res.json(success("Team deleted successfully", null));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/{teamId}/leave-requests:
   *   get:
   *     summary: Get leave requests for team (manager only)
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: status
   *         required: false
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected, all]
   *     responses:
   *       200:
   *         description: Leave requests retrieved
   */
  router.get("/:teamId/leave-requests", authMiddleware, authorizeTeamManager(teamUsecase), async (req, res) => {
    try {
      const status = req.query.status || "pending";
      const requests = await teamUsecase.getLeaveRequests(req.params.teamId, req.user.id, status);
      res.json(success("Leave requests fetched", requests));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/profile/update/{teamId}:
   *   put:
   *     summary: Update team profile (name and bio)
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               bio:
   *                 type: string
   *     responses:
   *       200:
   *         description: Team profile updated
   */
  router.put(
    "/profile/update/:teamId",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    async (req, res) => {
      try {
        const updated = await updateTeamProfileUsecase.execute(
          req.params.teamId,
          req.user.id,
          req.body
        );
        res.json(success("Team profile updated", toTeamResponseDTO(updated, req.user.id)));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  /**
   * @swagger
   * /teams/profile/picture/{teamId}:
   *   post:
   *     summary: Upload team profile picture
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               picture:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Picture updated
   */
  router.post(
    "/profile/picture/:teamId",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    upload.single("picture"),
    async (req, res) => {
      try {
        if (!req.file) throw new Error("No file uploaded");
        const updated = await updateTeamProfileUsecase.execute(
          req.params.teamId,
          req.user.id,
          { profilePicture: req.file.path }
        );
        res.json(success("Team profile picture updated", toTeamResponseDTO(updated, req.user.id)));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  /**
   * @swagger
   * /teams/leave-requests/{requestId}/approve:
   *   put:
   *     summary: Approve a leave request (Manager only)
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Leave request approved
   */
  router.put("/leave-requests/:requestId/approve", authMiddleware, async (req, res) => {
    try {
      const updated = await teamUsecase.approveLeave(req.params.requestId, req.user.id);
      res.json(success("Leave request approved", updated));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /teams/leave-requests/{requestId}/reject:
   *   put:
   *     summary: Reject a leave request (Manager only)
   *     tags: [Teams]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: requestId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Leave request rejected
   */
  router.put("/leave-requests/:requestId/reject", authMiddleware, async (req, res) => {
    try {
      const updated = await teamUsecase.rejectLeave(req.params.requestId, req.user.id);
      res.json(success("Leave request rejected", updated));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  return router;
};
