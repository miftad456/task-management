import express from "express";
import multer from "multer";
import { validateTask } from "../schema/task.schema.js";
import { toTaskResponseDTO } from "../dto/task.dto.js";
import { success, failure } from "../utilities/response.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import joi from "joi";
import { toUserResponseDTO } from "../dto/user.dto.js";

export const taskRouter = (dependencies) => {
  const router = express.Router();
  const {
    createTaskUsecase,
    updateTaskUsecase,
    deleteTaskUsecase,
    updateStatusUsecase,
    updatePriorityUsecase,
    getTaskUsecase,
    getAllTasksUsecase,
    getUrgentTasksUsecase,
    trackTimeUsecase,
    getOverdueTasksUsecase,
    getTimeLogsUsecase,
    uploadAttachmentUsecase,
    assignTaskUsecase,
    getAssignedTasksUsecase,
    getTeamTasksUsecase,
    getTeamMemberTasksUsecase,
    getMyTeamTasksUsecase,
  } = dependencies.usecases;

  // Create Task (protected)
  router.post("/create", authMiddleware, validateTask, async (req, res) => {
    try {
      const data = await createTaskUsecase.createTask(req.body, req.user?.id);
      res.json(success("Task created", toTaskResponseDTO(data)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Assign Task (protected - Manager only)
  router.post("/assign", authMiddleware, async (req, res) => {
    try {
      const task = await assignTaskUsecase.assignTask(req.body, req.user?.id);
      res.json(success("Task assigned successfully", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Get All Tasks (protected)
  router.get("/fetch", authMiddleware, async (req, res) => {
    try {
      const { search } = req.query;
      const tasks = await getAllTasksUsecase.getAllTasks(req.user?.id, search);
      res.json(success("Tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Get Assigned Tasks (protected)
  router.get("/assigned", authMiddleware, async (req, res) => {
    try {
      const tasks = await getAssignedTasksUsecase.getAssignedTasks(req.user?.id);
      res.json(success("Assigned tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /task/team/{teamId}/tasks:
   *   get:
   *     summary: Get all tasks for a team (Manager only)
   *     tags: [Team Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *         description: Team ID
   *     responses:
   *       200:
   *         description: All team tasks fetched successfully
   *       403:
   *         description: Access denied - Only team manager can view
   *       404:
   *         description: Team not found
   */
  router.get("/team/:teamId/tasks", authMiddleware, async (req, res) => {
    try {
      const { teamId } = req.params;
      const tasks = await getTeamTasksUsecase.getTeamTasks(teamId, req.user?.id);
      res.json(success("Team tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(err.message.includes("Access denied") || err.message.includes("Only") ? 403 : 400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /task/team/{teamId}/tasks/member/{userId}:
   *   get:
   *     summary: Get tasks for a specific team member (Manager or Team Member)
   *     tags: [Team Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *         description: Team ID
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: Target user ID
   *     responses:
   *       200:
   *         description: Member tasks fetched successfully (read-only for non-owners)
   *       403:
   *         description: Access denied - Must be team manager or member
   *       404:
   *         description: Team or user not found
   */
  router.get("/team/:teamId/tasks/member/:userId", authMiddleware, async (req, res) => {
    try {
      const { teamId, userId } = req.params;
      const tasks = await getTeamMemberTasksUsecase.getTeamMemberTasks(teamId, userId, req.user?.id);
      res.json(success("Member tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(err.message.includes("Access denied") ? 403 : 400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /task/team/{teamId}/my-tasks:
   *   get:
   *     summary: Get own tasks within a team context
   *     tags: [Team Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *         description: Team ID
   *     responses:
   *       200:
   *         description: Own team tasks fetched successfully
   *       403:
   *         description: Access denied - Not a team member
   *       404:
   *         description: Team not found
   */
  router.get("/team/:teamId/my-tasks", authMiddleware, async (req, res) => {
    try {
      const { teamId } = req.params;
      const tasks = await getMyTeamTasksUsecase.getMyTeamTasks(teamId, req.user?.id);
      res.json(success("My team tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(err.message.includes("Access denied") ? 403 : 400).json(failure(err.message));
    }
  });


  router.get("/overdue", authMiddleware, async (req, res) => {
    try {
      const tasks = await getOverdueTasksUsecase.getOverdueTasks(req.user?.id);
      res.json(success("Overdue tasks fetched", tasks.map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });
  // Get Urgent Tasks (protected)
  router.get("/urgent", authMiddleware, async (req, res) => {
    try {
      const userId = req.user?.id;

      const tasks = await getUrgentTasksUsecase.getUrgentTasks(userId);

      res.json(success("Urgent tasks fetched", tasks.map(toTaskResponseDTO)));
    } catch (error) {
      res.status(500).json(failure(error.message));
    }
  });


  // Get Task by ID (protected)
  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const task = await getTaskUsecase.getTask(req.params.id, req.user?.id);
      
      // Get comment count
      const commentCount = await dependencies.repos.commentRepository.countByTaskId(req.params.id);
      
      res.json(success("Task fetched", toTaskResponseDTO(task, commentCount)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Update Task (protected)
  router.put("/:id", authMiddleware, validateTask, async (req, res) => {
    try {
      const task = await updateTaskUsecase.updateTask(req.params.id, req.body, req.user?.id);
      res.json(success("Task updated", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Delete Task (protected)
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      await deleteTaskUsecase.deleteTask(req.params.id, req.user?.id);
      res.json(success("Task deleted", null));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });
  //update status task protected 
  router.patch("/:id/status", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const task = await updateStatusUsecase.updateStatus(
        req.params.id,
        status,
        req.user?.id
      );
      res.json(success("Task Status Updated", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });
  // update piroirity
  router.patch("/:id/priority", authMiddleware, async (req, res) => {
    try {
      const { priority } = req.body;
      const task = await updatePriorityUsecase.updatePriority(
        req.params.id,
        priority,
        req.user?.id
      );
      res.json(success("priority updated", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });



  // Track Time (protected)
  router.post("/:id/track", authMiddleware, async (req, res) => {
    try {
      const logData = req.body; // Expecting { minutes, note, startTime, endTime }
      const task = await trackTimeUsecase.trackTime(req.params.id, logData, req.user?.id);
      res.json(success("Time tracked", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Get Time Logs (protected)
  router.get("/:id/logs", authMiddleware, async (req, res) => {
    try {
      const logs = await getTimeLogsUsecase.getTimeLogs(req.params.id);
      res.json(success("Time logs fetched", logs));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  // Upload Attachment (protected)
  router.post("/:id/attachments", authMiddleware, (req, res) => {
    upload.single("file")(req, res, async (err) => {
      try {
        if (err) {
          if (err instanceof multer.MulterError) {
            return res.status(400).json(failure(err.message));
          }
          return res.status(400).json(failure(err.message));
        }
        if (!req.file) throw new Error("No file uploaded");

        const task = await uploadAttachmentUsecase.uploadAttachment(req.params.id, req.file, req.user?.id);
        res.json(success("File uploaded successfully", toTaskResponseDTO(task)));
      } catch (error) {
        console.error("Upload Error:", error);
        res.status(400).json(failure(error.message));
      }
    });
  });

  return router;
};
