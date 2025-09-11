import boardRedisService from '../services/boardRedisService.js';
import { User } from '../models/index.js'; // User model

/**
 * Registers all handlers for board-related WebSocket events on a given socket.
 * @param {Server} io - The main Socket.io server instance.
 * @param {Socket} socket - The individual client socket instance.
 * @param {Map} socketUserMap - Map to track socket-user-board relationships.
 */
export function registerBoardHandlers(io, socket, socketUserMap) {
  /**
   * Helper to fetch full user objects for all user IDs currently in a board.
   * @param {string} boardId
   * @returns {Promise<Array<{id:number,name:string,avatar_url:string|null}>>}
   */
  const getFullUsersInBoard = async (boardId) => {
    const userIds = await boardRedisService.getUsersInBoard(boardId);
    if (!userIds || userIds.length === 0) return [];

    // Ensure IDs are an array of numbers (if your DB uses integers)
    const ids = userIds.map((id) => Number(id));

    return User.findAll({
      where: { id: ids },
      attributes: ['id', 'name', 'avatar_url'],
    });
  };

  // ---- Join Board ----
  socket.on('join-board', async ({ boardId, userId }) => {
    if (!boardId || !userId) {
      socket.emit('error', { message: 'boardId and userId are required to join.' });
      return;
    }

    try {
      socket.join(boardId);
      socketUserMap.set(socket.id, { boardId, userId });

      await boardRedisService.addUserToBoard(boardId, userId);

      const users = await getFullUsersInBoard(boardId);
      io.to(boardId).emit('presence-update', users);

      console.log(`✅ User ${userId} (${socket.id}) joined board ${boardId}`);
    } catch (err) {
      console.error(`❌ join-board error (user ${userId}, board ${boardId}):`, err);
    }
  });

  // ---- Leave Board ----
  socket.on('leave-board', async ({ boardId, userId }) => {
    if (!boardId || !userId) return;

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

  // ---- Disconnect cleanup ----
  socket.on('disconnect', async () => {
    const entry = socketUserMap.get(socket.id);
    if (!entry) return;

    const { boardId, userId } = entry;
    socketUserMap.delete(socket.id);

    try {
      await boardRedisService.removeUserFromBoard(boardId, userId);
      const users = await getFullUsersInBoard(boardId);
      io.to(boardId).emit('presence-update', users);

      console.log(`🔌 Socket ${socket.id} disconnected; removed user ${userId} from board ${boardId}`);
    } catch (err) {
      console.error(`❌ disconnect cleanup error for socket ${socket.id}:`, err);
    }
  });

  // ---- Generic broadcast helper ----
  const broadcastToBoard = (eventName) => {
    socket.on(eventName, (data) => {
      if (data?.boardId) {
        socket.to(data.boardId).emit(eventName, data);
      }
    });
  };

  // Register broadcast events
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
