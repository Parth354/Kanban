// File: backend/websocket/boardEvents.js
import boardRedisService from "../services/boardRedisService.js";

/**
 * Registers all handlers for board-related WebSocket events on a given socket.
 * @param {Server} io - The main Socket.io server instance.
 * @param {Socket} socket - The individual client socket instance.
 * @param {Map} socketUserMap - The map to track socket-user-board relationships.
 */
export function registerBoardHandlers(io, socket, socketUserMap) {

  // ----- Join Board Room -----
  socket.on("join-board", async (payload) => {
    const { boardId, userId } = payload;
    if (!boardId || !userId) {
      // Optionally, emit an error back to the client
      socket.emit("error", { message: "boardId and userId are required to join." });
      return;
    }
    
    try {
      socket.join(boardId);
      // Map this socket's ID to the user and board for disconnect handling.
      socketUserMap.set(socket.id, { boardId, userId });
      
      await boardRedisService.addUserToBoard(boardId, userId);
      
      const users = await boardRedisService.getUsersInBoard(boardId);
      io.to(boardId).emit("presence-update", users); // Emit to everyone in the room.

      console.log(`User ${userId} (${socket.id}) joined board ${boardId}`);
    } catch (err) {
      console.error(`Error in 'join-board' event for user ${userId} on board ${boardId}:`, err);
    }
  });

  // ----- Leave Board Room (explicitly) -----
  socket.on("leave-board", async (payload) => {
    const { boardId, userId } = payload;
    if (!boardId || !userId) return;

    try {
      socket.leave(boardId);
      // Clean up the tracking map.
      socketUserMap.delete(socket.id);

      await boardRedisService.removeUserFromBoard(boardId, userId);

      const users = await boardRedisService.getUsersInBoard(boardId);
      io.to(boardId).emit("presence-update", users);

      console.log(`User ${userId} (${socket.id}) explicitly left board ${boardId}`);
    } catch (err) {
      console.error(`Error in 'leave-board' event for user ${userId} on board ${boardId}:`, err);
    }
  });

  /**
   * A helper function to create listeners that broadcast data to all other
   * clients in a board room. This avoids repeating the same logic.
   * @param {string} eventName - The name of the event to listen for and broadcast.
   */
  const broadcastToBoard = (eventName) => {
    socket.on(eventName, (data) => {
      // Ensure the payload has a boardId before broadcasting.
      if (data && data.boardId) {
        // Using socket.to() sends to everyone in the room *except* the sender.
        // This is ideal for optimistic UI updates on the client side.
        socket.to(data.boardId).emit(eventName, data);
      }
    });
  };

  // Register all broadcast events
  broadcastToBoard("card-created");
  broadcastToBoard("card-updated");
  broadcastToBoard("card-moved");
  broadcastToBoard("card-deleted");
  broadcastToBoard("user-typing");
  broadcastToBoard("column-created");
  broadcastToBoard("column-updated");
  broadcastToBoard("column-deleted");
}