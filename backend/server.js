require("dotenv").config({path:"../.env"});
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/database");

const boardRoutes = require("./routes/boards");
const columnRoutes = require("./routes/columns");
const cardRoutes = require("./routes/cards");
const auditLogRoutes = require("./routes/auditLogs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/audit-logs", auditLogRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();
