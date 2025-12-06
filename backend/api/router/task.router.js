import express from "express";
import { validateTask } from "../schema/task.schema.js";
import { toTaskResponseDTO } from "../dto/task.dto.js";
import { success, failure } from "../utilities/response.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
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
    getOverdueTasksUsecase ,
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

  // Get All Tasks (protected)
  router.get("/fetch", authMiddleware, async (req, res) => {
    try {
      const tasks = await getAllTasksUsecase.getAllTasks(req.user?.id);
      res.json(success("Tasks fetched", (tasks || []).map(toTaskResponseDTO)));
    } catch (err) {
      res.status(400).json(failure(err.message));
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
      res.json(success("Task fetched", toTaskResponseDTO(task)));
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
  router.patch("/:id/status",authMiddleware,async(req,res)=>{
    try{
      const  {status} =  req.body;
      const task =  await updateStatusUsecase.updateStatus(
        req.params.id,
        status,
        req.user?.id
      );
      res.json(success("Task Status Updated",toTaskResponseDTO(task)));
    }catch(err){
      res.status(400).json(failure(err.message));
    }
  });
  // update piroirity
  router.patch("/:id/priority",authMiddleware,async(req,res)=>{
    try{
      const {priority} =  req.body;
      const task  = await updatePriorityUsecase.updatePriority(
        req.params.id,
        priority,
        req.user?.id
      );
      res.json(success("priority updated",toTaskResponseDTO(task)));
    }catch(err){
      res.status(400).json(failure(err.message));
    }
  });
  


  // Track Time (protected)
  router.post("/:id/track", authMiddleware, async (req, res) => {
    try {
      const { minutes } = req.body;
      const task = await trackTimeUsecase.trackTime(req.params.id, minutes, req.user?.id);
      res.json(success("Time tracked", toTaskResponseDTO(task)));
    } catch (err) {
      res.status(400).json(failure(err.message));
    }
  });

  return router;
};
// refresh toke 
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTMzYzAzZjFmZThkNWViY2RkNjgxZjAiLCJ1c2VybmFtZSI6ImRhZCIsImVtYWlsIjoiZGFkQGdvb2dsZS5jb20iLCJpYXQiOjE3NjUwMzIwMDMsImV4cCI6MTc2NTYzNjgwM30.JLramgEhyt9f2KcMiljn6PEldqdIX9y_2UF9Z_qZX9s
