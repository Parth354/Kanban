import { Board, BoardMember, Column, Card, User } from '../models/index.js';
import auditLogService from './auditLogService.js';
import sequelize from '../config/database.js';
const { createLog } = auditLogService;

/**
 * (INTERNAL HELPER) Checks if a user is a member of a board and optionally has a specific role.
 * Throws a 403 Forbidden error if the user is not a member or doesn't have the required role.
 * @param {string} boardId - The board to check against.
 * @param {string} userId - The user to check.
 * @param {string|null} [requiredRole=null] - The minimum role required (e.g., 'admin').
 * @returns {Promise<BoardMember>} The board member record if successful.
 */
export const checkBoardMembership = async (boardId, userId, requiredRole = null) => {
  const member = await BoardMember.findOne({ where: { boardId, userId } });
  if (!member) {
    const error = new Error('Forbidden: You are not a member of this board.');
    error.statusCode = 403;
    throw error;
  }
  if (requiredRole && member.role !== requiredRole) {
     const error = new Error(`Forbidden: This action requires '${requiredRole}' role.`);
     error.statusCode = 403;
     throw error;
  }
  return member;
};

export const getBoards = async (userId, projectId) => {
  const whereClause = projectId ? { projectId } : {};
  return await Board.findAll({
    where: whereClause,
    include: [{
      model: BoardMember,
      where: { userId },
      attributes: [],
    }],
    order: [['createdAt', 'ASC']],
  });
};

export const getBoardById = async (boardId, userId) => {
  await checkBoardMembership(boardId, userId);
  return await Board.findByPk(boardId, {
    include: [{
      model: Column,
      as: 'columns',
      include: [{
        model: Card,
        as: 'cards',
        include: ['assignee', 'labels']
      }]
    }],
    order: [
      [sequelize.literal('"columns"."position"'), 'ASC'],
      [sequelize.literal('"columns->cards"."position"'), 'ASC']
    ],
  });
};

export const createBoard = async (boardData, userId) => {
  const board = await Board.create({ ...boardData });
  await BoardMember.create({ boardId: board.id, userId: userId, role: 'admin' });
  return board;
};

export const updateBoard = async (boardId, updateData, userId) => {
  await checkBoardMembership(boardId, userId, 'admin');
  const [updatedRowsArray] = await Board.update(updateData, { where: { id: boardId }, returning: true });
  if (updatedRowsArray.length === 0) throw new Error('Board not found.');
  return updatedRowsArray[0];
};

export const deleteBoard = async (boardId, userId) => {
  await checkBoardMembership(boardId, userId, 'admin');
  const deletedCount = await Board.destroy({ where: { id: boardId } });
  if (deletedCount === 0) throw new Error('Board not found.');
  return { message: 'Board deleted successfully.' };
};

export const getBoardMembers = async (boardId, userId) => {
    await checkBoardMembership(boardId, userId);
    return await BoardMember.findAll({
        where: { boardId },
        include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar_url'] }]
    });
};

export const addBoardMember = async (boardId, newUserId, currentUserId) => {
    await checkBoardMembership(boardId, currentUserId, 'admin');
    const newUser = await User.findByPk(newUserId);
    if (!newUser) throw new Error('User to be added not found.');
    const member = await BoardMember.create({ boardId, userId: newUserId, role: 'member' });
    await createLog({ boardId, userId: currentUserId, action: `added ${newUser.name} to the board.` });
    return member;
};

/**
 * Updates the role of a member on a board.
 * @param {string} boardId - The ID of the board.
 * @param {string} memberUserId - The ID of the user whose role is being changed.
 * @param {string} newRole - The new role to assign (e.g., 'admin', 'member').
 * @param {string} currentUserId - The ID of the user performing the action.
 * @returns {Promise<BoardMember>} The updated board member record.
 */
export const updateMemberRole = async (boardId, memberUserId, newRole, currentUserId) => {
  // 1. Permission Check: Current user must be an admin.
  await checkBoardMembership(boardId, currentUserId, 'admin');
  
  // 2. Critical Check: Prevent an admin from changing their own role if they are the last admin.
  if (currentUserId === memberUserId) {
    const adminCount = await BoardMember.count({ where: { boardId, role: 'admin' } });
    if (adminCount <= 1 && newRole !== 'admin') {
      const error = new Error('Forbidden: You cannot change your own role as you are the last admin on the board.');
      error.statusCode = 403;
      throw error;
    }
  }

  // 3. Find and update the member.
  const [updatedCount, updatedMembers] = await BoardMember.update(
    { role: newRole },
    { where: { boardId, userId: memberUserId }, returning: true }
  );

  if (updatedCount === 0) {
    throw new Error('Member not found on this board.');
  }

  // 4. Log the action.
  const updatedUser = await User.findByPk(memberUserId);
  await createLog({
    boardId,
    userId: currentUserId,
    action: `changed the role of ${updatedUser.name} to "${newRole}"`,
  });

  // 5. Return the updated member record.
  return updatedMembers[0];
};

export const removeMember = async (boardId, memberUserId, currentUserId) => {
    await checkBoardMembership(boardId, currentUserId, 'admin');
    const memberToRemove = await User.findByPk(memberUserId);
    if (!memberToRemove) throw new Error('User to be removed not found.');
    const deletedCount = await BoardMember.destroy({ where: { boardId, userId: memberUserId } });
    if (deletedCount === 0) throw new Error('Member not found on this board.');
    await createLog({ boardId, userId: currentUserId, action: `removed ${memberToRemove.name} from the board.` });
    return { message: 'Member removed successfully.' };
};