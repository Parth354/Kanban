import { Card, User, Label, Comment, Attachment } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';
import auditLogService from './auditLogService.js';
import notificationService from './notificationService.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

const getCardDetails = async (cardId, userId) => {
  const card = await Card.findByPk(cardId, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar_url'] },
      { model: Label, as: 'labels', through: { attributes: [] } },
      { model: Comment, include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }] },
      'attachments',
    ],
  });
  if (!card) throw new Error('Card not found.');
  await checkBoardMembership(card.boardId, userId);
  return card;
};

const createCard = async (cardData, userId) => {
  await checkBoardMembership(cardData.boardId, userId);
  const maxPosition = await Card.max('position', { where: { columnId: cardData.columnId } });
  const position = (maxPosition === null) ? 0 : maxPosition + 1;
  const card = await Card.create({ ...cardData, position });
  await auditLogService.createLog({ boardId: card.boardId, userId, action: `created card "${card.title}"` });
  return card;
};

const updateCard = async (cardId, updateData, userId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');
  await checkBoardMembership(card.boardId, userId);
  await card.update(updateData);
  await auditLogService.createLog({ boardId: card.boardId, userId, action: `updated card "${card.title}"` });
  return card;
};

const deleteCard = async (cardId, userId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');
  await checkBoardMembership(card.boardId, userId);
  const title = card.title;
  await card.destroy();
  await auditLogService.createLog({ boardId: card.boardId, userId, action: `deleted card "${title}"` });
  return { message: 'Card deleted successfully' };
};

const moveCard = async (cardId, { newColumnId, newPosition }, userId) => {
    const t = await sequelize.transaction();
    try {
        const card = await Card.findByPk(cardId, { transaction: t });
        if (!card) throw new Error('Card not found.');
        await checkBoardMembership(card.boardId, userId);

        const oldColumnId = card.columnId;
        const oldPosition = card.position;

        if (oldColumnId === newColumnId) {
            // Reordering within the same column
            if (oldPosition < newPosition) {
                await Card.update({ position: sequelize.literal('position - 1') }, {
                    where: { columnId: oldColumnId, position: { [Op.gt]: oldPosition, [Op.lte]: newPosition } }, transaction: t
                });
            } else {
                await Card.update({ position: sequelize.literal('position + 1') }, {
                    where: { columnId: oldColumnId, position: { [Op.gte]: newPosition, [Op.lt]: oldPosition } }, transaction: t
                });
            }
        } else {
            // Moving to a new column
            // 1. Shift cards in the old column
            await Card.update({ position: sequelize.literal('position - 1') }, {
                where: { columnId: oldColumnId, position: { [Op.gt]: oldPosition } }, transaction: t
            });
            // 2. Shift cards in the new column
            await Card.update({ position: sequelize.literal('position + 1') }, {
                where: { columnId: newColumnId, position: { [Op.gte]: newPosition } }, transaction: t
            });
        }

        card.columnId = newColumnId;
        card.position = newPosition;
        await card.save({ transaction: t });

        await t.commit();
        await auditLogService.createLog({ boardId: card.boardId, userId, action: `moved card "${card.title}"` });
        return card;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const assignUserToCard = async (cardId, assigneeId, currentUserId) => {
    const card = await Card.findByPk(cardId);
    if (!card) throw new Error('Card not found.');

    await checkBoardMembership(card.boardId, currentUserId);
    if (assigneeId) { // Check if assignee is also a member
        await checkBoardMembership(card.boardId, assigneeId);
    }
    
    card.assigneeId = assigneeId;
    await card.save();

    const assignee = await User.findByPk(assigneeId);
    await auditLogService.createLog({ boardId: card.boardId, userId: currentUserId, action: `assigned card "${card.title}" to ${assignee ? assignee.name : 'nobody'}` });
    
    if (assigneeId && assigneeId !== currentUserId) {
        await notificationService.createNotification({
            userId: assigneeId,
            type: 'card_assigned',
            data: { cardId, cardTitle: card.title, boardId: card.boardId, assignedByName: (await User.findByPk(currentUserId)).name }
        });
    }

    return card;
};

export default {
    getCardDetails,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    assignUserToCard
};