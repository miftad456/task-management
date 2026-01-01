import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";
import { toTaskResponseDTO } from "../dto/task.dto.js";

export const submissionRouter = (dependencies) => {
    const router = express.Router();
    const {
        submitTaskUsecase,
        reviewTaskUsecase,
    } = dependencies.usecases;

    // Submit Task (protected)
    router.post("/task/:id", authMiddleware, async (req, res) => {
        try {
            const { note } = req.body || {};
            const task = await submitTaskUsecase.submitTask(req.params.id, req.user?.id, note);
            res.json(success("Task submitted for review", toTaskResponseDTO(task)));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    // Review Task (protected - Manager only)
    router.put("/task/:id/review", authMiddleware, async (req, res) => {
        try {
            const { action, note } = req.body || {};
            const task = await reviewTaskUsecase.reviewTask(req.params.id, req.user?.id, action, note);
            res.json(success(`Task ${action}ed`, toTaskResponseDTO(task)));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    return router;
};
