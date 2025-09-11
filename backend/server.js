import './config/env.js';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from "./config/database.js";
import initSocket from "./websocket/socketHandler.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import boardRoutes from "./routes/board.js";
import columnRoutes from "./routes/column.js";
import cardRoutes from "./routes/card.js";
import commentRoutes from "./routes/comment.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
};

console.log('🌐 CORS origin:', corsOptions.origin);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/comments", commentRoutes);

// Static files for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Kanban API is running in development mode',
      environment: process.env.NODE_ENV,
      port: PORT,
      timestamp: new Date().toISOString()
    });
  });
}

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: sequelize ? 'configured' : 'not configured'
  });
});

app.use(notFound);
app.use(errorHandler);

const server = createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🚀 Port:', PORT);
    
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    
    // Sync models in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Synchronizing database models...');
      await sequelize.sync({ alter: true });
      console.log("✅ Models synchronized with the database.");
    }

    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    
    // More detailed error information
    if (err.name === 'SequelizeConnectionError') {
      console.error("🔍 Database connection details:");
      console.error("- Check your DATABASE_URL in .env file");
      console.error("- Verify Supabase database is running");
      console.error("- Check your internet connection");
    }
    
    process.exit(1);
  }
};

startServer();