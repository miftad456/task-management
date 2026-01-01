import { Comment } from "../../domain/entities/comment.entity.js";

export const createCommentUsecase = (commentRepository, taskRepository, teamRepository) => {
    const createComment = async (taskId, content, userId) => {
        // 1. Verify task exists
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");

        // 2. Access control based on task type
        if (task.teamId) {
            // Team task: verify user is manager or team member
            const team = await teamRepository.findById(task.teamId);
            if (!team) throw new Error("Team not found");
            
            const isManager = String(team.managerId) === String(userId);
            const isMember = team.members.some(m => String(m) === String(userId));
            
            if (!isManager && !isMember) {
                throw new Error("Access denied: Only team members can comment on team tasks");
            }
        } else {
            // Personal task: only task owner can comment
            if (String(task.userId) !== String(userId)) {
                throw new Error("Access denied: Only task owner can comment on personal tasks");
            }
        }

        const comment = new Comment({
            content,
            taskId,
            userId,
        });

        return await commentRepository.create(comment);
    };
    return { createComment };
};

export const getCommentsByTaskUsecase = (commentRepository, taskRepository, teamRepository) => {
    const getComments = async (taskId, userId) => {
        // 1. Verify task exists
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");

        // 2. Access control for viewing comments
        if (task.teamId) {
            // Team task: verify user is manager or team member
            const team = await teamRepository.findById(task.teamId);
            if (!team) throw new Error("Team not found");
            
            const isManager = String(team.managerId) === String(userId);
            const isMember = team.members.some(m => String(m) === String(userId));
            
            if (!isManager && !isMember) {
                throw new Error("Access denied: Only team members can view comments on team tasks");
            }
        } else {
            // Personal task: only task owner can view comments
            if (String(task.userId) !== String(userId)) {
                throw new Error("Access denied: Only task owner can view comments on personal tasks");
            }
        }

        return await commentRepository.findByTaskId(taskId);
    };
    return { getComments };
};

export const updateCommentUsecase = (commentRepository) => {
    const updateComment = async (commentId, content, userId) => {
        const comment = await commentRepository.findById(commentId);
        if (!comment) throw new Error("Comment not found");

        // Only comment owner can update
        if (String(comment.userId) !== String(userId)) {
            throw new Error("Unauthorized: Only comment owner can update this comment");
        }

        return await commentRepository.update(commentId, { content });
    };
    return { updateComment };
};

export const deleteCommentUsecase = (commentRepository) => {
    const deleteComment = async (commentId, userId) => {
        const comment = await commentRepository.findById(commentId);
        if (!comment) throw new Error("Comment not found");

        // Only comment owner can delete
        if (String(comment.userId) !== String(userId)) {
            throw new Error("Unauthorized: Only comment owner can delete this comment");
        }

        await commentRepository.delete(commentId);
    };
    return { deleteComment };
};
