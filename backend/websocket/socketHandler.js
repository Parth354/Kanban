import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import { registerBoardHandlers } from "./boardEvents.js";
import boardRedisService from "../services/boardRedisService.js";
import { User } from '../models/index.js'; // <-- Import the User model

// This in-memory map is crucial. It stores { socket.id -> { userId, boardId } }
// to track active users and handle disconnects properly.
const socketUserMap = new Map();

/**
 * Initializes the Socket.io server and sets up connection listeners and middleware.
 * @param {http.Server} server - The HTTP server instance to attach Socket.io to.
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  // --- SECURITY MIDDLEWARE ---
  // This runs for every new connecting socket, BEFORE the 'connection' event.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token.'));
      }
      // Attach the decoded user payload to the socket for use in event handlers.
      socket.user = decoded;
      next();
    });
  });

  // --- CONNECTION HANDLER ---
  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}, UserID: ${socket.user.userId}`);

    // Delegate all board-specific event handling to the specialized module.
    registerBoardHandlers(io, socket, socketUserMap);

    // The 'disconnect' event is handled here because it's at the core socket level.
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      const userInfo = socketUserMap.get(socket.id);

      if (userInfo) {
        const { boardId, userId } = userInfo;
        try {
          // 1. Remove the user from the presence set in Redis.
          await boardRedisService.removeUserFromBoard(boardId, userId);

          // 2. *** THE FIX IS HERE ***
          // Get the remaining user IDs from Redis.
          const remainingUserIds = await boardRedisService.getUsersInBoard(boardId);
          
          let remainingUsers = [];
          if (remainingUserIds.length > 0) {
            // If users remain, fetch their full details from the database.
            remainingUsers = await User.findAll({
              where: { id: remainingUserIds },
              attributes: ['id', 'name', 'avatar_url'],
            });
          }
          
          // 3. Broadcast the updated list of FULL USER OBJECTS.
          io.to(boardId).emit("presence-update", remainingUsers);

          console.log(`Cleaned up user ${userId} from board ${boardId} on disconnect.`);
        } catch (error) {
          console.error(`Error during disconnect cleanup for user ${userId} on board ${boardId}:`, error);
        } finally {
          // 4. IMPORTANT: Clean up the map to prevent memory leaks.
          socketUserMap.delete(socket.id);
        }
      }
    });
  });
}

export default initSocket;