export const toCommentResponseDTO = (comment) => {
    // If comment already has user info from repository (populated)
    if (comment.user) {
        return {
            id: comment.id,
            content: comment.content,
            taskId: comment.taskId,
            userId: comment.userId,
            user: comment.user,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
        };
    }
    
    // Fallback if no user info
    return {
        id: comment.id,
        content: comment.content,
        taskId: comment.taskId,
        userId: comment.userId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
    };
};

