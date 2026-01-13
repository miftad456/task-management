// backend/api/router/dashboard.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Personal and Team analytical statistics
 */

export const dashboardRouter = (dependencies) => {
    const router = express.Router();

    const {
        getUserDashboardUsecase,
        getTeamDashboardUsecase,
    } = dependencies.usecases;

    /**
     * @swagger
     * /dashboard:
     *   get:
     *     summary: Get personal dashboard statistics
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dashboard data fetched successfully
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
     * @swagger
     * /dashboard/team/{teamId}:
     *   get:
     *     summary: Get team dashboard statistics (manager only)
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: teamId
     *         required: true
     *         schema:
     *           type: string
     *         description: The ID of the team
     *     responses:
     *       200:
     *         description: Team dashboard data fetched
     *       403:
     *         description: Access denied - Manager only
     *       404:
     *         description: Team not found
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
