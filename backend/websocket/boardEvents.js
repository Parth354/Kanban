// File: backend/websocket/boardEvents.js
import boardRedisService from '../services/boardRedisService.js';
import { User } from '../models/index.js';

// A simple regex to validate if a string is in UUID format.
const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Registers all handlers for board-related WebSocket events on a given socket.
 * @param {Server} io - The main Socket.io server instance.
 * @param {Socket} socket - The individual client socket instance.
 * @param {Map} socketUserMap - Map to track socket-user-board relationships.
 */
export function registerBoardHandlers(io, socket, socketUserMap) {
  /**
   * (HELPER FUNCTION)
   * Fetches full user details for all valid user IDs currently in a board from Redis.
   * @param {string} boardId
   * @returns {Promise<Array<object>>} An array of user objects ({ id, name, avatar_url }).
   */
  const getFullUsersInBoard = async (boardId) => {
    let userIds = await boardRedisService.getUsersInBoard(boardId);

    // --- ROBUSTNESS FIX ---
    // Filter the array from Redis to ensure every ID is a valid, non-empty UUID string.
    // This cleans up any potential bad data and prevents crashes.
    const validUserIds = userIds.filter(id => id && typeof id === 'string' && isUuid.test(id));

    if (validUserIds.length === 0) {
      return [];
    }

    // Query the database only with the clean, validated list of UUIDs.
    return User.findAll({
      where: { id: validUserIds },
      attributes: ['id', 'name', 'avatar_url'],
    });
  };

  // ---- Join Board ----
  socket.on('join-board', async (payload) => {
    try {
      const { boardId, userId } = payload;
      
      // --- INPUT VALIDATION FIX ---
      // Ensure the payload from the client is valid before processing.
      if (!boardId || !userId || !isUuid.test(userId)) {
        console.error("Invalid join-board payload received:", payload);
        socket.emit('error', { message: 'Invalid boardId or userId provided.' });
        return;
      }
      
      socket.join(boardId);
      socketUserMap.set(socket.id, { boardId, userId });

      await boardRedisService.addUserToBoard(boardId, userId);

      // Get and broadcast the updated presence list.
      const users = await getFullUsersInBoard(boardId);
      io.to(boardId).emit('presence-update', users);

      console.log(`✅ User ${userId} (${socket.id}) joined board ${boardId}`);
    } catch (err) {
      console.error(`❌ join-board error (user ${payload?.userId}, board ${payload?.boardId}):`, err);
    }
  });

  // ---- Leave Board ----
  socket.on('leave-board', async (payload) => {
    if (!payload || !payload.boardId || !payload.userId) return;

    const { boardId, userId } = payload;
    try {
      socket.leave(boardId);
      socketUserMap.delete(socket.id);

      await boardRedisService.removeUserFromBoard(boardId, userId);

      const users = await getFullUsersInBoard(boardId);
      io.to(boardId).emit('presence-update', users);

      console.log(`👋 User ${userId} (${socket.id}) left board ${boardId}`);
    } catch (err) {
      console.error(`❌ leave-board error (user ${userId}, board ${boardId}):`, err);
    }
  });

  // ---- Note on Disconnect ----
  // The primary disconnect logic should live in `socketHandler.js` as it is now.
  // This ensures cleanup happens even if `leave-board` is not explicitly emitted.
  // We do not need a duplicate 'disconnect' listener here.

  // ---- Generic Broadcast Helper ----
  const broadcastToBoard = (eventName) => {
    socket.on(eventName, (data) => {
      // Broadcast to all other clients in the room.
      if (data && data.boardId) {
        socket.to(data.boardId).emit(eventName, data);
      }
    });
  };

  // Register all broadcast events
  [
    'card-created',
    'card-updated',
    'card-moved',
    'card-deleted',
    'user-typing',
    'column-created',
    'column-updated',
    'column-deleted',
  ].forEach(broadcastToBoard);
}