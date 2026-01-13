import express from "express";
import { validateTask } from "../schema/task.schema.js";
import { toTaskResponseDTO } from "../dto/task.dto.js";
import { success, failure } from "../utilities/response.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task management operations
 *   - name: Team Tasks
 *     description: Tasks filtered by team context
 */

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
    deleteCompletedTasksUsecase,
  } = dependencies.usecases;

  /**
   * @swagger
   * /tasks/create:
   *   post:
   *     summary: Create a new task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskInput'
   *     responses:
   *       200:
   *         description: Task created successfully
   */
  router.post("/create", authMiddleware, validateTask, async (req, res) => {
    try {
      const data = await createTaskUsecase.createTask(req.body, req.user?.id);
      res.json(success("Task created", toTaskResponseDTO(data)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/assign:
   *   post:
   *     summary: Assign a task to a team member (Manager only)
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *               userId:
   *                 type: string
   *               teamId:
   *                 type: string
   *               title:
   *                 type: string
   *     responses:
   *       200:
   *         description: Task assigned successfully
   */
  router.post("/assign", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      const taskData = req.body;
      if (req.file) {
        taskData.attachments = [{
          filename: req.file.filename,
          originalName: req.file.originalname,
          url: `/uploads/${req.file.filename}`,
          mimetype: req.file.mimetype,
          size: req.file.size,
          uploadedAt: new Date(),
        }];
      }
      const task = await assignTaskUsecase.assignTask(taskData, req.user?.id);
      res.json(success("Task assigned successfully", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/assigned:
   *   get:
   *     summary: Get tasks assigned to current user
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Assigned tasks fetched successfully
   */
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
   * /tasks/fetch:
   *   get:
   *     summary: Get all tasks for authenticated user
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tasks fetched
   */
  router.get("/fetch", authMiddleware, async (req, res) => {
    try {
      const { search, status } = req.query;
      const tasks = await getAllTasksUsecase.getAllTasks(req.user?.id, search, status);
      res.json(success("Tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/overdue:
   *   get:
   *     summary: Get overdue tasks for current user
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Overdue tasks fetched
   */
  router.get("/overdue", authMiddleware, async (req, res) => {
    try {
      const tasks = await getOverdueTasksUsecase.getOverdueTasks(req.user?.id);
      res.json(success("Overdue tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/urgent:
   *   get:
   *     summary: Get urgent tasks for current user
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Urgent tasks fetched
   */
  router.get("/urgent", authMiddleware, async (req, res) => {
    try {
      const tasks = await getUrgentTasksUsecase.getUrgentTasks(req.user?.id);
      res.json(success("Urgent tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/completed:
   *   delete:
   *     summary: Delete all completed tasks for current user
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Completed tasks deleted
   */
  router.delete("/completed", authMiddleware, async (req, res) => {
    try {
      await deleteCompletedTasksUsecase.deleteCompletedTasks(req.user?.id);
      res.json(success("Completed tasks deleted", null));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}:
   *   get:
   *     summary: Get task by ID
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Task fetched
   */
  router.get("/:id", authMiddleware, async (req, res) => {
    try {
      const task = await getTaskUsecase.getTask(req.params.id, req.user?.id);
      const commentCount = await dependencies.repos.commentRepository.countByTaskId(req.params.id);
      res.json(success("Task fetched", toTaskResponseDTO(task, commentCount)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}:
   *   put:
   *     summary: Update task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskInput'
   *     responses:
   *       200:
   *         description: Task updated
   */
  router.put("/:id", authMiddleware, validateTask, async (req, res) => {
    try {
      const task = await updateTaskUsecase.updateTask(req.params.id, req.body, req.user?.id);
      res.json(success("Task updated", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}:
   *   delete:
   *     summary: Delete task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Task deleted
   */
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      await deleteTaskUsecase.deleteTask(req.params.id, req.user?.id);
      res.json(success("Task deleted", null));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/team/{teamId}/tasks:
   *   get:
   *     summary: Get all tasks for a team (Manager or Member)
   *     tags: [Team Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Team tasks fetched
   */
  router.get("/team/:teamId/tasks", authMiddleware, async (req, res) => {
    try {
      const tasks = await getTeamTasksUsecase.getTeamTasks(req.params.teamId, req.user?.id);
      res.json(success("Team tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/team/{teamId}/member/{userId}:
   *   get:
   *     summary: Get tasks for a specific team member
   *     tags: [Team Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Member tasks fetched
   */
  router.get("/team/:teamId/member/:userId", authMiddleware, async (req, res) => {
    try {
      const tasks = await getTeamMemberTasksUsecase.getTeamMemberTasks(
        req.params.teamId,
        req.params.userId,
        req.user?.id
      );
      res.json(success("Member tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/my-team-tasks/{teamId}:
   *   get:
   *     summary: Get my tasks within a team context
   *     tags: [Team Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: teamId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: My team tasks fetched
   */
  router.get("/my-team-tasks/:teamId", authMiddleware, async (req, res) => {
    try {
      const tasks = await getMyTeamTasksUsecase.getMyTeamTasks(
        req.params.teamId,
        req.user?.id
      );
      res.json(success("My team tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}/status:
   *   patch:
   *     summary: Update task status
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, in-progress, completed, archived]
   *     responses:
   *       200:
   *         description: Status updated
   */
  router.patch("/:id/status", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const task = await updateStatusUsecase.updateStatus(req.params.id, status, req.user?.id);
      res.json(success("Status updated", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}/priority:
   *   patch:
   *     summary: Update task priority
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               priority:
   *                 type: string
   *                 enum: [low, medium, high]
   *     responses:
   *       200:
   *         description: Priority updated
   */
  router.patch("/:id/priority", authMiddleware, async (req, res) => {
    try {
      const { priority } = req.body;
      const task = await updatePriorityUsecase.updatePriority(req.params.id, priority, req.user?.id);
      res.json(success("Priority updated", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}/track-time:
   *   post:
   *     summary: Track time for a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               minutes:
   *                 type: number
   *               note:
   *                 type: string
   *     responses:
   *       200:
   *         description: Time tracked
   */
  router.post("/:id/track-time", authMiddleware, async (req, res) => {
    try {
      const task = await trackTimeUsecase.trackTime(req.params.id, req.body, req.user?.id);
      res.json(success("Time tracked", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  /**
   * @swagger
   * /tasks/{id}/attachments:
   *   post:
   *     summary: Upload attachment to task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Attachment uploaded
   */
  router.post("/:id/attachments", authMiddleware, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) throw new Error("No file uploaded");
      const task = await uploadAttachmentUsecase.uploadAttachment(req.params.id, req.file, req.user?.id);
      res.json(success("Attachment uploaded", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  return router;
};
