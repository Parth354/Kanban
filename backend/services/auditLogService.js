import { AuditLog, User } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';

const getLogsByBoard = async (boardId, userId) => {
  await checkBoardMembership(boardId, userId);
  return await AuditLog.findAll({
    where: { boardId },
    include: [{ model: User, attributes: ['id', 'name', 'avatar_url'] }],
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
};

const createLog = async (logData) => {
  try {
    return await AuditLog.create(logData);
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw an error, as logging failure should not stop the main action
  }
};

export default { getLogsByBoard, createLog };