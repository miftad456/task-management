// backend/api/router/submission.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";
import { toTaskResponseDTO } from "../dto/task.dto.js";

/**
 * @swagger
 * tags:
 *   - name: Submissions
 *     description: Task submission and review process
 */

export const submissionRouter = (dependencies) => {
    const router = express.Router();
    const {
        submitTaskUsecase,
        reviewTaskUsecase,
    } = dependencies.usecases;

    /**
     * @swagger
     * /submissions/task/{id}:
     *   post:
     *     summary: Submit a task for review (Assigned member only)
     *     tags: [Submissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               link:
     *                 type: string
     *                 example: https://github.com/user/repo/pull/1
     *               note:
     *                 type: string
     *                 example: Finished the report, please review.
     *     responses:
     *       200:
     *         description: Task submitted successfully
     */
    router.post("/task/:id", authMiddleware, async (req, res) => {
        try {
            const { link, note } = req.body || {};
            const task = await submitTaskUsecase.submitTask(req.params.id, req.user?.id, link, note);
            res.json(success("Task submitted for review", toTaskResponseDTO(task)));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    /**
     * @swagger
     * /submissions/task/{id}/review:
     *   put:
     *     summary: Review a submitted task (Manager only)
     *     tags: [Submissions]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [action]
     *             properties:
     *               action:
     *                 type: string
     *                 enum: [approve, reject]
     *               note:
     *                 type: string
     *                 example: Great work, approved.
     *     responses:
     *       200:
     *         description: Review completed
     */
    router.put("/task/:id/review", authMiddleware, async (req, res) => {
        try {
            const { action, note } = req.body || {};
            const task = await reviewTaskUsecase.reviewTask(req.params.id, req.user?.id, action, note);
            res.json(success(`Task ${action}ed`, toTaskResponseDTO(task)));
        } catch (err) {
            console.error('ROUTER ERROR:', err.message);
            res.status(400).json(failure(err.message));
        }
    });

    return router;
};
