import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";

export const dashboardRouter = (dependencies) => {
    const router = express.Router();

    const {
        getUserDashboardUsecase,
        getTeamDashboardUsecase,
    } = dependencies.usecases;

    /**
     * GET /dashboard
     * Personal dashboard (all users)
     */
    router.get("/", authMiddleware, async (req, res) => {
        try {
            const data = await getUserDashboardUsecase.getDashboard(req.user.id);
            res.json(success("Dashboard fetched", data));
        } catch (error) {
            res.status(400).json(failure(error.message));
        }
    });

    /**
     * GET /dashboard/team/:teamId
     * Team dashboard (manager only)
     */
    router.get("/team/:teamId", authMiddleware, async (req, res) => {
        try {
            const data = await getTeamDashboardUsecase.getDashboard(
                req.params.teamId,
                req.user.id
            );
            res.json(success("Team dashboard fetched", data));
        } catch (error) {
            res.status(
                error.message.includes("Access denied") ? 403 : 400
            ).json(failure(error.message));
        }
    });

    return router;
};
