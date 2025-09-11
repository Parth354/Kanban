import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import { registerBoardHandlers } from "./boardEvents.js";
import boardRedisService from "../services/boardRedisService.js";
import { User } from '../models/index.js';

const socketUserMap = new Map();

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || "*" },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token not provided.'));
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error: Invalid token.'));
      socket.user = decoded;
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}, UserID: ${socket.user.userId}`);
    registerBoardHandlers(io, socket, socketUserMap);

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      const userInfo = socketUserMap.get(socket.id);

      if (userInfo) {
        const { boardId, userId } = userInfo;
        try {
          await boardRedisService.removeUserFromBoard(boardId, userId);

          // --- APPLY THE SAME DEFENSIVE FIX HERE ---
          let remainingUserIds = await boardRedisService.getUsersInBoard(boardId);
          remainingUserIds = remainingUserIds.filter(id => id && typeof id === 'string'); // Filter invalid IDs
          
          let remainingUsers = [];
          if (remainingUserIds.length > 0) {
            remainingUsers = await User.findAll({
              where: { id: remainingUserIds },
              attributes: ['id', 'name', 'avatar_url'],
            });
          }
          
          io.to(boardId).emit("presence-update", remainingUsers);
          console.log(`Cleaned up user ${userId} from board ${boardId} on disconnect.`);
        } catch (error) {
          console.error(`Error during disconnect cleanup for user ${userId} on board ${boardId}:`, error);
        } finally {
          socketUserMap.delete(socket.id);
        }
      }
    });
  });
}

export default initSocket;