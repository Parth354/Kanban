require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const http = require("http"); // Needed for Socket.io
const { sequelize } = require("./config/database");
const initSocket = require("./websocket/socket"); // WebSocket handlers

// Routes
const boardRoutes = require("./routes/boards");
const columnRoutes = require("./routes/columns");
const cardRoutes = require("./routes/cards");
const auditLogRoutes = require("./routes/auditLogs");
const authRoutes = require("./routes/auth");
const authenticate = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
const server = http.createServer(app);
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
