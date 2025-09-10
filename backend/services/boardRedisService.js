const redis = require("../config/redis");

// Presence tracking
async function addUserToBoard(boardId, userId) {
  await redis.sadd(`board:${boardId}:users`, userId);
}

async function removeUserFromBoard(boardId, userId) {
  await redis.srem(`board:${boardId}:users`, userId);
}

async function getUsersInBoard(boardId) {
  return await redis.smembers(`board:${boardId}:users`);
}

// Optional: caching board data
async function cacheBoard(boardId, data) {
  await redis.set(`board:${boardId}`, JSON.stringify(data), "EX", 60 * 5); // 5 min TTL
}

async function getCachedBoard(boardId) {
  const data = await redis.get(`board:${boardId}`);
  return data ? JSON.parse(data) : null;
}

// Cleanup
async function cleanupBoard(boardId) {
  await redis.del(`board:${boardId}`);
  await redis.del(`board:${boardId}:users`);
}

module.exports = {
  addUserToBoard,
  removeUserFromBoard,
  getUsersInBoard,
  cacheBoard,
  getCachedBoard,
  cleanupBoard,
};
