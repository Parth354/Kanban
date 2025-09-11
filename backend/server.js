import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import sequelize from "./config/database.js";
import initSocket from "./websocket/socketHandler.js";

// Import Middleware
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

// Import Routes
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import boardRoutes from "./routes/board.js";
import columnRoutes from "./routes/column.js";
import cardRoutes from "./routes/card.js";
import commentRoutes from "./routes/comment.js";

// Load Environment Variables
configDotenv({ path:'../.env' });

const app = express();
const PORT = process.env.PORT || 3000;
// ===== Core Middleware =====
// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', 
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/comments", commentRoutes);
// ===== Health Check Endpoint =====
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ===== Error Handling Middleware =====
// Handle 404 Not Found errors for any routes not matched above
app.use(notFound);
// Centralized error handler to catch all thrown errors
app.use(errorHandler);

// ===== Create HTTP Server & Initialize Socket.io =====
const server = createServer(app);
initSocket(server); // Initialize WebSocket handlers

// ===== Start Server =====
const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
    
    // In development, `alter: true` can be useful.
    // In production, you should use migrations instead to avoid data loss.
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log("Models synchronized with the database.");
    }

    server.listen(PORT, () => console.log(`🚀 Server is listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1); // Exit with failure
  }
};

startServer();