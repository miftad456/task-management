// backend/api/router/comment.router.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";
import { validateComment } from "../schema/comment.schema.js";
import { toCommentResponseDTO } from "../dto/comment.dto.js";

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Task comments and collaboration
 */

export const commentRouter = (dependencies) => {
    const router = express.Router();
    const {
        createCommentUsecase,
        getCommentsByTaskUsecase,
        updateCommentUsecase,
        deleteCommentUsecase,
    } = dependencies.usecases;

    /**
     * @swagger
     * /comments/task/{taskId}:
     *   post:
     *     summary: Add a comment to a task
     *     tags: [Comments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CommentInput'
     *     responses:
     *       200:
     *         description: Comment added successfully
     */
    router.post("/task/:taskId", authMiddleware, validateComment, async (req, res) => {
        try {
            const { content } = req.body;
            const comment = await createCommentUsecase.createComment(
                req.params.taskId,
                content,
                req.user?.id
            );

            const commentWithUser = await dependencies.repos.commentRepository.findById(comment.id);
            res.json(success("Comment added", toCommentResponseDTO(commentWithUser)));
        } catch (err) {
            const statusCode = err.message.includes("Access denied") ? 403 : 400;
            res.status(statusCode).json(failure(err.message));
        }
    });

    /**
     * @swagger
     * /comments/task/{taskId}:
     *   get:
     *     summary: Get all comments for a task
     *     tags: [Comments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: taskId
     *         required: true
     *         schema:
     *           type: string
     *         description: Task ID
     *     responses:
     *       200:
     *         description: Comments retrieved successfully
     */
    router.get("/task/:taskId", authMiddleware, async (req, res) => {
        try {
            const comments = await getCommentsByTaskUsecase.getComments(
                req.params.taskId,
                req.user?.id
            );
            res.json(success("Comments fetched", comments.map(c => toCommentResponseDTO(c))));
        } catch (err) {
            const statusCode = err.message.includes("Access denied") ? 403 : 400;
            res.status(statusCode).json(failure(err.message));
        }
    });

    /**
     * @swagger
     * /comments/{id}:
     *   put:
     *     summary: Update a comment
     *     tags: [Comments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Comment ID
     */
    router.put("/:id", authMiddleware, validateComment, async (req, res) => {
        try {
            const { content } = req.body;
            const updatedComment = await updateCommentUsecase.updateComment(
                req.params.id,
                content,
                req.user?.id
            );

            if (!updatedComment) {
                return res.status(404).json(failure("Comment not found"));
            }

            res.json(success("Comment updated", toCommentResponseDTO(updatedComment)));
        } catch (err) {
            const statusCode = err.message.includes("Unauthorized") ? 403 : 400;
            res.status(statusCode).json(failure(err.message));
        }
    });

    /**
     * @swagger
     * /comments/{id}:
     *   delete:
     *     summary: Delete a comment
     *     tags: [Comments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Comment ID
     */
    router.delete("/:id", authMiddleware, async (req, res) => {
        try {
            await deleteCommentUsecase.deleteComment(req.params.id, req.user?.id);
            res.json(success("Comment deleted", null));
        } catch (err) {
            const statusCode = err.message.includes("Unauthorized") ? 403 : 400;
            res.status(statusCode).json(failure(err.message));
        }
    });

    return router;
};
