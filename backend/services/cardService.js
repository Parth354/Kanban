import { Card, User, Label, Comment, Attachment, Column } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';
import auditLogService from './auditLogService.js';
const { createLog }  = auditLogService;
import emailService from './emailService.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getCardDetails = async (cardId, userId) => {
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

export const createCard = async (cardData, userId) => {
  await checkBoardMembership(cardData.boardId, userId);
  const maxPosition = await Card.max('position', { where: { columnId: cardData.columnId } });
  const position = (maxPosition === null) ? 0 : maxPosition + 1;
  const card = await Card.create({ ...cardData, position });
  await createLog({ boardId: card.boardId, userId, action: `created card "${card.title}"` });
  return card;
};

export const updateCard = async (cardId, updateData, userId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');
  await checkBoardMembership(card.boardId, userId);
  await card.update(updateData);
  await createLog({ boardId: card.boardId, userId, action: `updated card "${card.title}"` });
  return card;
};

export const deleteCard = async (cardId, userId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');
  await checkBoardMembership(card.boardId, userId);
  const title = card.title;
  await card.destroy();
  await createLog({ boardId: card.boardId, userId, action: `deleted card "${title}"` });
  return { message: 'Card deleted successfully' };
};

export const moveCard = async (cardId, moveData, userId) => {
  const { newColumnId, newPosition } = moveData;
  if (!newColumnId || newPosition === undefined || newPosition < 0) {
    const error = new Error('Invalid newColumnId or newPosition provided.');
    error.statusCode = 400;
    throw error;
  }

  const t = await sequelize.transaction();
  try {
    const card = await Card.findByPk(cardId, { transaction: t });
    if (!card) {
      const error = new Error('Card not found.');
      error.statusCode = 404;
      throw error;
    }

    await checkBoardMembership(card.boardId, userId);
    
    const destColumn = await Column.findByPk(newColumnId, { transaction: t });
    if (!destColumn || destColumn.boardId !== card.boardId) {
      const error = new Error('Invalid destination column.');
      error.statusCode = 400;
      throw error;
    }
    
    const oldColumnId = card.columnId;
    const oldPosition = card.position;

    await Card.update({ position: sequelize.literal('position - 1') }, { where: { columnId: oldColumnId, position: { [Op.gt]: oldPosition } }, transaction: t });
    await Card.update({ position: sequelize.literal('position + 1') }, { where: { columnId: newColumnId, position: { [Op.gte]: newPosition } }, transaction: t });

    card.columnId = newColumnId;
    card.position = newPosition;
    await card.save({ transaction: t });

    await t.commit();
    await createLog({ boardId: card.boardId, userId, action: `moved card "${card.title}" to ${destColumn.title}` });
    return card;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const assignUserToCard = async (cardId, assigneeId, currentUserId) => {
    const card = await Card.findByPk(cardId, { include: ['board'] });
    if (!card) throw new Error('Card not found.');
    
    await checkBoardMembership(card.boardId, currentUserId);
    if (assigneeId) {
        await checkBoardMembership(card.boardId, assigneeId);
    }

    const previousAssigneeId = card.assigneeId;
    card.assigneeId = assigneeId;
    await card.save();

    const assignee = assigneeId ? await User.findByPk(assigneeId) : null;
    const currentUser = await User.findByPk(currentUserId);
    
    await createLog({ boardId: card.boardId, userId: currentUserId, action: `assigned card "${card.title}" to ${assignee ? assignee.name : 'nobody'}` });

    if (assigneeId && assigneeId !== currentUserId && assigneeId !== previousAssigneeId) {
      try {
        await emailService.sendEmail({
          to: assignee.email,
          subject: `You have been assigned to a card: ${card.title}`,
          text: `Hi ${assignee.name},\n\n${currentUser.name} has assigned you to the card "${card.title}" on the board "${card.board.title}".`,
          html: `<p>Hi ${assignee.name},</p><p>${currentUser.name} has assigned you to the card "<strong>${card.title}</strong>" on the board "<strong>${card.board.title}</strong>".</p>`,
        });
      } catch (emailError) {
        console.error("Failed to send assignment email:", emailError);
      }
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