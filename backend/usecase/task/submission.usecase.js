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

export const reviewTaskUsecase = (taskRepository, notificationRepository) => {
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
        let notificationType;
        let message;

        if (action === "approve") {
            newStatus = "completed";
            notificationType = "task_approved";
            message = `Your submission for task "${task.title}" has been approved!`;
        } else if (action === "reject") {
            newStatus = "pending";
            notificationType = "task_rejected";
            message = `Your submission for task "${task.title}" has been rejected. Feedback: ${reviewNote || "No feedback provided."}`;
        } else {
            throw new Error("Invalid review action. Use 'approve' or 'reject'");
        }

        const updatedTask = await taskRepository.update(taskId, {
            status: newStatus,
            managerFeedback: reviewNote
        });

        // 🔹 Create notification for the member
        if (notificationRepository) {
            await notificationRepository.create({
                recipientId: task.userId,
                senderId: managerId,
                type: notificationType,
                message: message,
                link: `/task/${taskId}`,
                isUrgent: action === "reject"
            });
        }

        return updatedTask;
    };
    return { reviewTask };
};
