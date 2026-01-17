export const submitTaskUsecase = (taskRepository) => {
    const submitTask = async (taskId, userId, submissionLink = "", submissionNote = "") => {
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");

        // Only the assigned user can submit
        if (String(task.userId) !== String(userId)) {
            throw new Error("Only the assigned user can submit this task");
        }

        if (task.status === "completed") {
            throw new Error("Task is already completed");
        }

        // Update status to submitted and add link/note
        const updatedTask = await taskRepository.update(taskId, {
            status: "submitted",
            submissionLink,
            submissionNote
        });

        return updatedTask;
    };
    return { submitTask };
};

export const reviewTaskUsecase = (taskRepository) => {
    const reviewTask = async (taskId, managerId, action, reviewNote = "") => {
        const task = await taskRepository.findById(taskId);
        if (!task) throw new Error("Task not found");

        // Only the manager who assigned it can review
        if (String(task.assignedBy) !== String(managerId)) {
            throw new Error("Only the manager who assigned this task can review it");
        }

        if (task.status !== "submitted") {
            throw new Error("Task must be submitted before review");
        }

        let newStatus;
        if (action === "approve") {
            newStatus = "completed";
        } else if (action === "reject") {
            newStatus = "pending";
        } else {
            throw new Error("Invalid review action. Use 'approve' or 'reject'");
        }

        const updatedTask = await taskRepository.update(taskId, {
            status: newStatus,
            managerFeedback: reviewNote
        });

        return updatedTask;
    };
    return { reviewTask };
};
