import express from "express";
import { success, failure } from "../utilities/response.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const notificationRouter = (dependencies) => {
    const router = express.Router();
    const { notificationUsecase } = dependencies.usecases;

    /**
     * GET /notifications
     * Fetch notifications for the current user
     */
    router.get("/", authMiddleware, async (req, res) => {
        try {
            const data = await notificationUsecase.getNotifications(req.user.id);
            res.json(success("Notifications fetched", data));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    /**
     * PUT /notifications/:id/read
     * Mark a notification as read
     */
    router.put("/:id/read", authMiddleware, async (req, res) => {
        try {
            const updated = await notificationUsecase.markAsRead(req.params.id, req.user.id);
            res.json(success("Notification marked as read", updated));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    /**
     * PUT /notifications/read-all
     * Mark all notifications as read
     */
    router.put("/read-all", authMiddleware, async (req, res) => {
        try {
            await notificationUsecase.markAllAsRead(req.user.id);
            res.json(success("All notifications marked as read", null));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    return router;
};
