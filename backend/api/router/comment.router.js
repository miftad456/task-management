import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { success, failure } from "../utilities/response.js";
import { validateComment } from "../schema/comment.schema.js";
import { toCommentResponseDTO } from "../dto/comment.dto.js";

export const commentRouter = (dependencies) => {
    const router = express.Router();
    const {
        createCommentUsecase,
        getCommentsByTaskUsecase,
        updateCommentUsecase,
        deleteCommentUsecase,
    } = dependencies.usecases;

    // Create Comment (protected)
    router.post("/task/:taskId", authMiddleware, validateComment, async (req, res) => {
        try {
            const { content } = req.body;
            const comment = await createCommentUsecase.createComment(
                req.params.taskId, 
                content, 
                req.user?.id
            );
            
            // Fetch comment with user info for response
            const commentWithUser = await dependencies.repos.commentRepository.findById(comment.id);
            res.json(success("Comment added", toCommentResponseDTO(commentWithUser)));
        } catch (err) {
            const statusCode = err.message.includes("Access denied") ? 403 : 400;
            res.status(statusCode).json(failure(err.message));
        }
    });

    // Get Comments for Task (protected)
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

    // Update Comment (protected)
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

    // Delete Comment (protected)
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
