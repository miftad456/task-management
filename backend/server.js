import express from "express";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { taskRouter } from "./api/router/task.router.js";
import { userRouter } from "./api/router/user.router.js";
import { teamRouter } from "./api/router/team.router.js";
import { commentRouter } from "./api/router/comment.router.js";
import { dashboardRouter } from "./api/router/dashboard.router.js";
import { submissionRouter } from "./api/router/submission.router.js";
import { notificationRouter } from "./api/router/notification.router.js";
import { dependencies } from "./api/dependencies.js";
import { swaggerOptions } from "./swagger.config.js";


export const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Swagger documentation setup
  try {
    const specs = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true, // Keeps your JWT token even after refresh
      },
    }));
    console.log('✅ Swagger Docs available at http://localhost:3000/api-docs');
  } catch (error) {
    console.error('❌ Swagger initialization failed:', error.message);
  }

  // ... (rest of your router logic)
  app.use("/tasks", taskRouter(dependencies));
  app.use("/users", userRouter(dependencies));
  app.use("/teams", teamRouter(dependencies));
  app.use("/dashboard", dashboardRouter(dependencies));
  app.use("/comments", commentRouter(dependencies));
  app.use("/submissions", submissionRouter(dependencies));
  app.use("/notifications", notificationRouter(dependencies));

  app.get("/", (req, res) => {
    res.send("Task Management API is running...");
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    const status = err.status || 400;
    res.status(status).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  });

  return app;
};