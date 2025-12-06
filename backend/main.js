import dotenv from "dotenv";
import { createServer } from "./server.js";
import { connectDB } from "./infrastructure/db/session.js"; // or the path you used


dotenv.config();

const start = async () => {
  await connectDB();
  const app = createServer();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
