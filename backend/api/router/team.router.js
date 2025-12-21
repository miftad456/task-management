// backend/api/router/team.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { success, failure } from "../utilities/response.js";
import { authorizeTeamManager } from "../middlewares/teamAccess.middleware.js";
import { toTeamResponseDTO } from "../dto/team.dto.js";

export const teamRouter = (dependencies) => {
  const router = express.Router();
  const { teamUsecase } = dependencies.usecases;

  // -------------------------------------------------------------
  //                    TEAM CRUD + MEMBER MGMT
  // -------------------------------------------------------------

  // Create a team
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

    // Add member to team
  router.post(
    "/:teamId/member",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    async (req, res) => {
      try {
        const { teamId } = req.params;
        const { username, userId } = req.body;
        const identifier = userId || username;
        if (!identifier) return res.status(400).json(failure("username or userId is required"));

        const { team: updatedTeam, addedUser } = await teamUsecase.addMember(teamId, identifier);

        // Respond with username of the added member (and the updated team DTO)
        res.json(success("Member added", {
          username: addedUser.username,
          team: toTeamResponseDTO(updatedTeam, req.user.id)
        }));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );
  // before we adding to a member shouldn't we know that the member we are going to add is the user
  // of our applicatiion if it's not we should say we couldn.t find the user with this username

  // Remove member from team
  router.delete(
    "/:teamId/member",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    async (req, res) => {
      try {
        const { teamId } = req.params;
        const { username, userId } = req.body;
        const identifier = userId || username;
        if (!identifier) return res.status(400).json(failure("username or userId is required"));

        const { team: updatedTeam, removedUser } = await teamUsecase.removeMember(teamId, identifier);

        // Respond with username of the removed member (and the updated team DTO)
        res.json(success("Member removed", {
          username: removedUser.username,
          team: toTeamResponseDTO(updatedTeam, req.user.id)
        }));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );
  // Get a team by ID (Manager or Team Member)
  router.get("/:teamId", authMiddleware, async (req, res) => {
    try {
      const { teamId } = req.params;
      const team = await teamUsecase.getTeamById(teamId);

      const isManager = String(team.managerId) === String(req.user.id);
      const isMember = (team.members || []).some(m => String(m) === String(req.user.id));

      if (!isManager && !isMember) {
        return res.status(403).json(failure("Access denied"));
      }

      res.json(success("Team fetched", toTeamResponseDTO(team, req.user.id)));
    } catch (err) {
      res.status(404).json(failure(err.message));
    }
  });

  // Get team by name
  router.get("/by-name/:name", authMiddleware, roleMiddleware("manager"), async (req, res) => {
    try {
      const team = await teamUsecase.getTeamByName(req.user.id, req.params.name);
      res.json(success("Team fetched", toTeamResponseDTO(team, req.user.id)));
    } catch (err) {
      res.status(404).json(failure(err.message));
    }
  });

  // Get all teams of manager
  router.get("/manager/all", authMiddleware, roleMiddleware("manager"), async (req, res) => {
    try {
      const teams = await teamUsecase.getTeamsByManager(req.user.id);
      res.json(success("Teams fetched", teams.map(t => toTeamResponseDTO(t, req.user.id))));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Get all teams of a member
  router.get("/member/all", authMiddleware, async (req, res) => {
    try {
      const teams = await teamUsecase.getTeamsByMember(req.user.id);
      res.json(success("Teams fetched", teams.map(t => toTeamResponseDTO(t, req.user.id))));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // -------------------------------------------------------------
  //                       LEAVE REQUEST SYSTEM
  // -------------------------------------------------------------

  /** 1️⃣ MEMBER REQUESTS TO LEAVE A TEAM
      DELETE /team/:teamId/leave
  */
  router.delete(
    "/:teamId/leave",
    authMiddleware,
    async (req, res) => {
      try {
        const { teamId } = req.params;
        const userId = req.user.id;

        const request = await teamUsecase.requestLeave(teamId, userId);

        res.json(success("Leave request submitted", request));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  /** 2️⃣ MANAGER GETS ALL LEAVE REQUESTS
      GET /team/:teamId/leave-requests
  */
  router.get(
    "/:teamId/leave-requests",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    async (req, res) => {
      try {
        const { teamId } = req.params;
        const managerId = req.user.id;

        const requests = await teamUsecase.getLeaveRequests(teamId, managerId);

        res.json(success("Leave requests fetched", requests));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  /** 3️⃣ MANAGER APPROVES LEAVE REQUEST
      PUT /team/:teamId/leave-request/:requestId/approve
  */
  router.put(
    "/:teamId/leave-request/:requestId/approve",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    async (req, res) => {
      try {
        const { requestId } = req.params;
        const managerId = req.user.id;

        const result = await teamUsecase.approveLeave(requestId, managerId);

        res.json(success("Leave request approved", result));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  /** 4️⃣ MANAGER REJECTS LEAVE REQUEST
      PUT /team/:teamId/leave-request/:requestId/reject
  */
  router.put(
    "/:teamId/leave-request/:requestId/reject",
    authMiddleware,
    authorizeTeamManager(teamUsecase),
    async (req, res) => {
      try {
        const { requestId } = req.params;
        const managerId = req.user.id;

        const result = await teamUsecase.rejectLeave(requestId, managerId);

        res.json(success("Leave request rejected", result));
      } catch (err) {
        res.status(400).json(failure(err.message));
      }
    }
  );

  return router;
};
