import redis from "../config/redis.js";

// Configuration for cache expiration (Time To Live in seconds)
const BOARD_CACHE_TTL = 300; // 5 minutes

/**
 * Adds a user to the set of online users for a specific board.
 * @param {string} boardId - The UUID of the board.
 * @param {string} userId - The UUID of the user.
 */
async function addUserToBoard(boardId, userId) {
  const key = `board:${boardId}:users`;
  try {
    await redis.sadd(key, userId);
  } catch (error) {
    console.error(`Redis Error: Failed to add user ${userId} to board ${boardId}.`, error);
    throw new Error("Could not update board presence.");
  }
}

/**
 * Removes a user from the set of online users for a specific board.
 * @param {string} boardId - The UUID of the board.
 * @param {string} userId - The UUID of the user.
 */
async function removeUserFromBoard(boardId, userId) {
  const key = `board:${boardId}:users`;
  try {
    await redis.srem(key, userId);
  } catch (error) {
    console.error(`Redis Error: Failed to remove user ${userId} from board ${boardId}.`, error);
    throw new Error("Could not update board presence.");
  }
}

/**
 * Retrieves a list of all unique user IDs currently on a board.
 * @param {string} boardId - The UUID of the board.
 * @returns {Promise<string[]>} An array of user IDs.
 */
async function getUsersInBoard(boardId) {
  const key = `board:${boardId}:users`;
  try {
    return await redis.smembers(key);
  } catch (error) {
    console.error(`Redis Error: Failed to get users for board ${boardId}.`, error);
    throw new Error("Could not retrieve board presence.");
  }
}

/**
 * Caches the full data object for a board.
 * @param {string} boardId - The UUID of the board.
 * @param {object} data - The board data object to cache.
 */
async function cacheBoard(boardId, data) {
  const key = `board:${boardId}:data`;
  try {
    // 'EX' sets the expiration time in seconds.
    await redis.set(key, JSON.stringify(data), "EX", BOARD_CACHE_TTL);
  } catch (error) {
    console.error(`Redis Error: Failed to cache data for board ${boardId}.`, error);
    // This is a non-critical error, so we don't need to throw.
  }
}

/**
 * Retrieves the cached data for a board.
 * @param {string} boardId - The UUID of the board.
 * @returns {Promise<object|null>} The parsed board data object, or null if not found.
 */
async function getCachedBoard(boardId) {
  const key = `board:${boardId}:data`;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis Error: Failed to get cached data for board ${boardId}.`, error);
    return null; // Return null on error to force a database fetch.
  }
}

/**
 * Deletes the cached data for a board.
 * This should be called whenever board data is updated (e.g., card moved, column added).
 * @param {string} boardId - The UUID of the board.
 */
async function clearCachedBoard(boardId) {
    const key = `board:${boardId}:data`;
    try {
        await redis.del(key);
    } catch (error) {
        console.error(`Redis Error: Failed to clear cache for board ${boardId}.`, error);
    }
}

/**
 * Deletes all Redis keys associated with a board (presence and cache).
 * This is intended to be used when a board is permanently deleted.
 * @param {string} boardId - The UUID of the board.
 */
async function cleanupBoard(boardId) {
  const presenceKey = `board:${boardId}:users`;
  const dataKey = `board:${boardId}:data`;
  try {
    await redis.del(presenceKey, dataKey);
  } catch (error) {
    console.error(`Redis Error: Failed to cleanup keys for board ${boardId}.`, error);
  }
}

export default {
  addUserToBoard,
  removeUserFromBoard,
  getUsersInBoard,
  cacheBoard,
  getCachedBoard,
  clearCachedBoard, // Export the new function
  cleanupBoard,
};