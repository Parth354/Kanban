import { Server } from "socket.io";
import { registerBoardHandlers } from "./boardEvents.js";
import boardRedisService from "../services/boardRedisService.js";

// This in-memory map is crucial. It stores { socket.id -> { userId, boardId } }
// to track active users and handle disconnects properly.
const socketUserMap = new Map();

/**
 * Initializes the Socket.io server and sets up connection listeners.
 * @param {http.Server} server - The HTTP server instance to attach Socket.io to.
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*", // Use environment variable for security
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ New client connected: ${socket.id}`);

    // Delegate all board-related event handling to the specialized module.
    // We pass `io`, the individual `socket`, and our tracking `map`.
    registerBoardHandlers(io, socket, socketUserMap);

    // The 'disconnect' event is handled here because it's at the core socket level.
    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Look up the disconnected socket to find which user and board it was on.
      const userInfo = socketUserMap.get(socket.id);

      if (userInfo) {
        const { boardId, userId } = userInfo;
        try {
          // Remove the user from the presence set in Redis.
          await boardRedisService.removeUserFromBoard(boardId, userId);

          // Get the newly updated list of users on that board.
          const users = await boardRedisService.getUsersInBoard(boardId);
          
          // Broadcast the updated presence list to all remaining clients in the board room.
          io.to(boardId).emit("presence-update", users);

          console.log(`Cleaned up user ${userId} from board ${boardId} on disconnect.`);
        } catch (error) {
          console.error(`Error during disconnect cleanup for user ${userId} on board ${boardId}:`, error);
        } finally {
          // IMPORTANT: Clean up the map to prevent memory leaks.
          socketUserMap.delete(socket.id);
        }
      }
    });
  });
}

export default initSocket;