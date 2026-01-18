import { Task } from "../../domain/entities/task.entity.js";

export const createTaskUsecase = (taskRepository) => {
  const createTask = async (taskData, userId) => {
    taskData.userId = userId;
    const task = new Task(taskData);
    return await taskRepository.create(task);
  };
  return { createTask };
};

export const getTaskUsecase = (taskRepository, teamRepository) => {
  const getTask = async (id, userId) => {
    const task = await taskRepository.findById(id);
    if (!task) throw new Error("Task ID not found");

    // Access control:
    // 1. Task owner (assignee) always has access
    if (userId && String(task.userId) === String(userId)) return task;

    // 2. If it's a team task, check if requester is manager or member
    if (task.teamId && userId && teamRepository) {
      const team = await teamRepository.findById(task.teamId);
      if (team) {
        const isManager = String(team.managerId.id || team.managerId) === String(userId);
        const isMember = team.members.some(m => String(m.id || m) === String(userId));
        if (isManager || isMember) return task;
      }
    }

    if (userId) throw new Error("Not allowed to access this task");
    return task;
  };
  return { getTask };
};

export const getAllTasksUsecase = (taskRepository) => {
  const getAllTasks = async (userId, search = "", status = "") => {
    // Return all tasks (personal + assigned)
    return await taskRepository.findAllByUserId(userId, search, status);
  };
  return { getAllTasks };
};

export const updateTaskUsecase = (taskRepository) => {
  const updateTask = async (id, updates, userId) => {
    const task = await getTaskUsecase(taskRepository).getTask(id, userId);
    if (!task) throw new Error("Task not found");

    // Restriction: Assigned members cannot mark assigned tasks as completed
    if (updates.status === "completed" && task.assignedBy && String(task.userId) === String(userId)) {
      throw new Error("Assigned tasks must be submitted for review to be marked as completed");
    }

    const updatedTask = await taskRepository.update(id, updates);
    return updatedTask;
  };
  return { updateTask };
};

export const deleteTaskUsecase = (taskRepository, teamRepository) => {
  const deleteTask = async (id, userId) => {
    const task = await getTaskUsecase(taskRepository, teamRepository).getTask(id, userId);
    if (!task) throw new Error("Task not found");

    // Access Control for Deletion:
    // 1. Personal tasks: Only the owner can delete
    const isOwner = String(task.userId) === String(userId);

    // 2. Assigned tasks: Only the assigner OR the team manager can delete
    let isManagerOrAssigner = false;
    if (task.assignedBy) {
      const isAssigner = String(task.assignedBy) === String(userId);
      let isTeamManager = false;
      if (task.teamId && teamRepository) {
        const team = await teamRepository.findById(task.teamId);
        if (team) {
          isTeamManager = String(team.managerId.id || team.managerId) === String(userId);
        }
      }
      isManagerOrAssigner = isAssigner || isTeamManager;
    }

    if (!isOwner && !isManagerOrAssigner) {
      throw new Error("Not allowed to delete this task");
    }

    await taskRepository.delete(id);
    return true;
  };
  return { deleteTask };
};

export const trackTimeUsecase = (taskRepository, timeLogRepository) => {
  const trackTime = async (taskId, logData, userId) => {
    const { minutes, note, startTime, endTime } = logData;

    if (!Number.isFinite(minutes)) throw new Error("Invalid minutes");
    if (minutes <= 0) throw new Error("Minutes must be positive");

    const task = await getTaskUsecase(taskRepository).getTask(taskId, userId);
    if (!task) throw new Error("Task not found");

    // 1. Create the time log entry
    await timeLogRepository.create({
      taskId,
      userId,
      duration: Number(minutes),
      note: note || "",
      startTime: startTime || null,
      endTime: endTime || null,
    });

    // 2. Update the task's total timeSpent (denormalized for performance)
    const newTotalTime = (task.timeSpent || 0) + Number(minutes);
    const updatedTask = await taskRepository.update(taskId, { timeSpent: newTotalTime });

    return updatedTask;
  };
  return { trackTime };
};

export const getTimeLogsUsecase = (timeLogRepository) => {
  const getTimeLogs = async (taskId) => {
    if (!taskId) throw new Error("Task ID is required");
    return await timeLogRepository.findByTaskId(taskId);
  };
  return { getTimeLogs };
};
/// New: Update Status
// ---------------------
export const updateStatusUsecase = (taskRepository) => {
  const updateStatus = async (taskId, newStatus, userId) => {
    if (!newStatus) throw new Error("Status is required");
    const allowedStatuses = ["pending", "in-progress", "completed", "archived"];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error("Invalid status value");
    }

    const task = await getTaskUsecase(taskRepository).getTask(taskId, userId);

    // Restriction: Assigned members cannot mark assigned tasks as completed
    if (newStatus === "completed" && task.assignedBy && String(task.userId) === String(userId)) {
      throw new Error("Assigned tasks must be submitted for review to be marked as completed");
    }

    const updatedTask = await taskRepository.update(taskId, { status: newStatus });
    return updatedTask;
  };
  return { updateStatus };
};
// New: Update Priority
// ---------------------
export const updatePriorityUsecase = (taskRepository) => {
  const updatePriority = async (taskId, newPriority, userId) => {
    if (!newPriority) throw new Error("Priority is required");
    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(newPriority)) {
      throw new Error("Invalid priority value");
    }

    const task = await getTaskUsecase(taskRepository).getTask(taskId, userId);
    const updatedTask = await taskRepository.update(taskId, { priority: newPriority });
    return updatedTask;
  };
  return { updatePriority };
};
export const getOverdueTasksUsecase = (taskRepository) => {
  const getOverdueTasks = async (userId) => {
    // 1️⃣ Get all tasks for the user
    const allTasks = await taskRepository.findAllByUserId(userId);

    // 2️⃣ Map to Task entity to use isOverdue()
    const overdueTasks = allTasks
      .map(taskData => new Task(taskData))
      .filter(task => task.isOverdue());

    return overdueTasks;
  };

  return { getOverdueTasks };
};
export const getUrgentTasksUsecase = ({ taskRepository }) => {
  const getUrgentTasks = async (userId) => {
    // 1️⃣ Fetch all tasks for the user
    const allTasks = await taskRepository.findAllByUserId(userId);

    // 2️⃣ Convert to Task entities
    const taskEntities = allTasks.map(taskData => new Task(taskData));

    // 3️⃣ Filter urgent tasks considering user-defined threshold or default logic
    let urgentTasks = taskEntities.filter(task => {
      if (task.status === "completed") return false;

      if (task.urgentBeforeMinutes != null) {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const minutesLeft = (deadline - now) / (1000 * 60);
        return minutesLeft <= task.urgentBeforeMinutes;
      } else {
        return task.isUrgent();
      }
    });

    // 4️⃣ Fallback: if no urgent tasks, return nearest tasks based on deadline and priority
    if (urgentTasks.length === 0) {
      urgentTasks = taskEntities
        .filter(task => task.status !== "completed" && task.deadline) // only pending tasks with deadlines
        .sort((a, b) => {
          const deadlineDiff = new Date(a.deadline) - new Date(b.deadline);
          if (deadlineDiff !== 0) return deadlineDiff; // sooner deadline first
          // If same deadline, higher priority first
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 3); // optional: limit to top 5 nearest tasks
    }

    return urgentTasks;
  };

  return { getUrgentTasks };
};

export const uploadAttachmentUsecase = (taskRepository) => {
  const uploadAttachment = async (taskId, fileData, userId) => {
    const task = await getTaskUsecase(taskRepository).getTask(taskId, userId);
    if (!task) throw new Error("Task not found");

    const newAttachment = {
      filename: fileData.filename,
      originalName: fileData.originalname,
      url: `/uploads/${fileData.filename}`,
      mimetype: fileData.mimetype,
      size: fileData.size,
      uploadedAt: new Date(),
    };

    const updatedAttachments = [...(task.attachments || []), newAttachment];
    const updatedTask = await taskRepository.update(taskId, { attachments: updatedAttachments });

    return updatedTask;
  };
  return { uploadAttachment };
};


export const assignTaskUsecase = (taskRepository, teamRepository, notificationRepository) => {
  const assignTask = async (taskData, managerId) => {
    const { userId, teamId } = taskData;
    if (!userId || !teamId) throw new Error("User ID and Team ID are required for assignment");

    // 1. Verify team exists and requester is the manager
    const team = await teamRepository.findById(teamId);
    if (!team) throw new Error("Team not found");

    const teamManagerId = team.managerId?.id || team.managerId;
    if (String(teamManagerId) !== String(managerId)) {
      throw new Error("Only the team manager can assign tasks");
    }

    // 2. Verify target user is a member of the team
    const isMember = team.members.some(m => {
      const memberId = m?.id || m;
      return String(memberId) === String(userId);
    });

    if (!isMember) {
      throw new Error("Target user is not a member of this team");
    }

    // 3. Create the task with teamId
    const task = new Task({
      ...taskData,
      assignedBy: managerId,
      teamId: teamId, // Set teamId for team-based queries
    });

    const savedTask = await taskRepository.create(task);

    // 4. Create notification for the assigned user
    if (notificationRepository) {
      await notificationRepository.create({
        recipientId: userId,
        senderId: managerId,
        type: "task_assigned",
        message: `You have been assigned a new task: ${task.title}`,
        link: `/task/${savedTask.id}`,
        isUrgent: task.priority === "high"
      });
    }

    return savedTask;
  };
  return { assignTask };
};
export const getAssignedTasksUsecase = (taskRepository) => {
  const getAssignedTasks = async (userId) => {
    if (!userId) throw new Error("User ID is required");
    return await taskRepository.findAllAssignedToUserId(userId);
  };
  return { getAssignedTasks };
};

export const deleteCompletedTasksUsecase = (taskRepository) => {
  const deleteCompletedTasks = async (userId) => {
    if (!userId) throw new Error("User ID is required");
    return await taskRepository.deleteCompletedTasks(userId);
  };
  return { deleteCompletedTasks };
};
