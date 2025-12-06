import express from "express";
import { taskRouter } from "./api/router/task.router.js";
import { userRouter } from "./api/router/user.router.js";
import { dependencies } from "./api/dependencies.js";

export const createServer = () => {
  const app = express();
  app.use(express.json());

  // Pass dependencies to routers
  app.use("/tasks", taskRouter(dependencies));
  app.use("/users", userRouter(dependencies));

  // Health check
  app.get("/", (req, res) => {
    res.send("Task Management API is running...");
  });

  return app;
};