import { configDotenv } from "dotenv";
import express, { json, urlencoded } from "express";
import cors from "cors";
import { createServer } from "http"; // Needed for Socket.io
import sequelize from "./config/database.js";
import initSocket from "./websocket/socket.js"; // WebSocket handlers

// Routes
import boardRoutes from "./routes/boards.js";
import columnRoutes from "./routes/columns.js";
import cardRoutes from "./routes/cards.js";
import auditLogRoutes from "./routes/auditLogs.js";
import authRoutes from "./routes/auth.js";
import authenticate from "./middleware/auth.js";

configDotenv({path:"../.env"});
const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// ===== API Routes =====
app.post("/api/boards", authenticate, boardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// ===== Health Check =====
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

// ===== Test DB Connection =====
app.get("/db-test", async (req, res) => {
  try {
    const [result] = await sequelize.query("SELECT NOW()");
    res.json({ dbTime: result[0].now });
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ===== Create HTTP Server & Socket.io =====
const server = createServer(app);
initSocket(server); // Initialize WebSocket with Redis

// ===== Start Server =====
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync({ alter: true });
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ Unable to start server:", err);
  }
})();
