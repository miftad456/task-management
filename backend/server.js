import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { taskRouter } from "./api/router/task.router.js";
import { userRouter } from "./api/router/user.router.js";
import { teamRouter } from "./api/router/team.router.js";
import { commentRouter } from "./api/router/comment.router.js";
import { dashboardRouter } from "./api/router/dashboard.router.js";
import { submissionRouter } from "./api/router/submission.router.js";
import { dependencies } from "./api/dependencies.js";
import { swaggerOptions } from "./swagger.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... existing imports ...

export const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // UPDATED: Serve the root folder so that 'uploads/filename.jpg' 
  // from the DB works directly as http://localhost:3000/uploads/filename.jpg
  app.use(express.static(path.join(__dirname)));

  // Keep this as a backup if you prefer specific routing
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

  app.get("/", (req, res) => {
    res.send("Task Management API is running...");
  });

  return app;
};