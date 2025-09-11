import { configDotenv } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from 'path';
import { fileURLToPath } from 'url';

import sequelize from "./config/database.js";
import initSocket from "./websocket/socketHandler.js";
import notFound  from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import boardRoutes from "./routes/board.js";
import columnRoutes from "./routes/column.js";
import cardRoutes from "./routes/card.js";
import commentRoutes from "./routes/comment.js";

configDotenv({ path: new URL('../.env', import.meta.url).pathname });

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/comments", commentRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/:path(*)', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running in development mode...');
  });
}

app.get("/health", (req, res) => res.status(200).json({ status: "ok", uptime: process.uptime() }));
app.use(notFound);
app.use(errorHandler);

const server = createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    
    // In production, you should use migrations. `alter: true` is for development.
    if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: true });
        console.log("Models synchronized with the database.");
    }

    server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server is listening on port ${PORT}`));
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1);
  }
};

startServer();