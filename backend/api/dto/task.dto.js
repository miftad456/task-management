export const toTaskResponseDTO = (task, commentCount = null) => {
  const dto = {
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    deadline: task.deadline,
    status: task.status,
    createdAt: task.createdAt,
    timeSpent: task.timeSpent,
    userId: task.userId,
    assignedBy: task.assignedBy,
    teamId: task.teamId,
    attachments: task.attachments || [],
  };
  
  // Add comment count if provided
  if (commentCount !== null && commentCount !== undefined) {
    dto.commentCount = commentCount;
  }
  
  return dto;
};
