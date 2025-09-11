import redis from "../config/redis.js";
const { sadd, srem, smembers, set, get, del } = redis
// Presence tracking
async function addUserToBoard(boardId, userId) {
  await sadd(`board:${boardId}:users`, userId);
}

async function removeUserFromBoard(boardId, userId) {
  await srem(`board:${boardId}:users`, userId);
}

async function getUsersInBoard(boardId) {
  return await smembers(`board:${boardId}:users`);
}

// Optional: caching board data
async function cacheBoard(boardId, data) {
  await set(`board:${boardId}`, JSON.stringify(data), "EX", 60 * 5); // 5 min TTL
}

async function getCachedBoard(boardId) {
  const data = await get(`board:${boardId}`);
  return data ? JSON.parse(data) : null;
}

// Cleanup
async function cleanupBoard(boardId) {
  await del(`board:${boardId}`);
  await del(`board:${boardId}:users`);
}

export default {
  addUserToBoard,
  removeUserFromBoard,
  getUsersInBoard,
  cacheBoard,
  getCachedBoard,
  cleanupBoard,
};
