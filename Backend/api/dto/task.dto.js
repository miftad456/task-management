export const toTaskResponseDTO = (task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    deadline: task.deadline,
    status: task.status,
    createdAt: task.createdAt,
});
