// backend/api/middlewares/teamAccess.middleware.js
import { failure } from "../utilities/response.js";

// Accept teamUsecase (as in DI) to fetch team
export const authorizeTeamManager = (teamUsecase) => {
  return async (req, res, next) => {
    try {
      const teamId = req.params.teamId;
      if (!teamId) return res.status(400).json(failure("Missing team ID"));

      const team = await teamUsecase.getTeamById(teamId);
      if (!team) return res.status(404).json(failure("Team not found"));

      if (String(team.managerId) !== String(req.user?.id)) {
        return res.status(403).json(failure("Forbidden: only team manager can perform this action"));
      }

      req.team = team;
      next();
    } catch (err) {
      return res.status(500).json(failure("Team authorization failed"));
    }
  };
};