import { Label, Card, CardLabel } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';
import auditLogService from './auditLogService.js';

/**
 * Creates a new, reusable label for a specific board.
 * @param {string} boardId - The ID of the board to which the label will belong.
 * @param {object} labelData - The data for the new label.
 * @param {string} labelData.name - The text of the label.
 * @param {string} labelData.color - The hex color code for the label.
 * @param {string} userId - The ID of the user creating the label.
 * @returns {Promise<Label>} The newly created label.
 */
const createLabelForBoard = async (boardId, labelData, userId) => {
  // Security Check: Ensure the user is a member of the board.
  await checkBoardMembership(boardId, userId);

  const { name, color } = labelData;
  if (!name || !color) {
    const error = new Error('Label name and color are required.');
    error.statusCode = 400;
    throw error;
  }

  const label = await Label.create({
    name,
    color,
    boardId,
  });

  return label;
};

/**
 * Retrieves all available labels for a given board.
 * @param {string} boardId - The ID of the board.
 * @param {string} userId - The ID of the user requesting the labels.
 * @returns {Promise<Label[]>} An array of labels for the board.
 */
const getLabelsForBoard = async (boardId, userId) => {
  await checkBoardMembership(boardId, userId);
  return await Label.findAll({ where: { boardId }, order: [['name', 'ASC']] });
};

/**
 * Updates an existing label's name or color.
 * @param {string} labelId - The ID of the label to update.
 * @param {object} updateData - The data to update.
 * @param {string} userId - The ID of the user performing the update.
 * @returns {Promise<Label>} The updated label.
 */
const updateLabel = async (labelId, updateData, userId) => {
  const label = await Label.findByPk(labelId);
  if (!label) {
    const error = new Error('Label not found.');
    error.statusCode = 404;
    throw error;
  }

  await checkBoardMembership(label.boardId, userId);
  await label.update(updateData);
  return label;
};

/**
 * Deletes a label from a board entirely. This will also remove it from all associated cards.
 * @param {string} labelId - The ID of the label to delete.
 * @param {string} userId - The ID of the user performing the deletion.
 * @returns {Promise<{message: string}>} A success message.
 */
const deleteLabel = async (labelId, userId) => {
  const label = await Label.findByPk(labelId);
  if (!label) {
    const error = new Error('Label not found.');
    error.statusCode = 404;
    throw error;
  }

  // Permission Check: Only board admins can delete shared labels.
  await checkBoardMembership(label.boardId, userId, 'admin');

  await label.destroy(); // Sequelize will handle deleting entries from the CardLabel join table.
  return { message: 'Label deleted successfully.' };
};

/**
 * Associates an existing label with a card.
 * @param {string} cardId - The ID of the card.
 * @param {string} labelId - The ID of the label to add.
 * @param {string} userId - The ID of the user performing the action.
 * @returns {Promise<CardLabel>} The association record.
 */
const addLabelToCard = async (cardId, labelId, userId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');

  const label = await Label.findByPk(labelId);
  if (!label) throw new Error('Label not found.');

  // Security & Integrity Check: Ensure both the card and label belong to the same board.
  if (card.boardId !== label.boardId) {
    const error = new Error('Forbidden: Card and Label do not belong to the same board.');
    error.statusCode = 403;
    throw error;
  }

  // Permission Check: User must be a member of the board.
  await checkBoardMembership(card.boardId, userId);

  // Use Sequelize's add<Model> method to create the association.
  // This automatically prevents duplicates.
  const association = await card.addLabel(label);

  await auditLogService.createLog({
    boardId: card.boardId,
    userId,
    action: `added label "${label.name}" to card "${card.title}"`,
  });

  return association;
};

/**
 * Removes a label's association from a card.
 * @param {string} cardId - The ID of the card.
 * @param {string} labelId - The ID of the label to remove.
 * @param {string} userId - The ID of the user performing the action.
 * @returns {Promise<{message: string}>} A success message.
 */
const removeLabelFromCard = async (cardId, labelId, userId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');

  const label = await Label.findByPk(labelId);
  if (!label) throw new Error('Label not found.');

  await checkBoardMembership(card.boardId, userId);

  // Use Sequelize's remove<Model> method.
  const result = await card.removeLabel(label);

  if (result === 0) {
    // This means the label wasn't on the card in the first place.
    return { message: 'Label was not associated with this card.' };
  }

  await auditLogService.createLog({
    boardId: card.boardId,
    userId,
    action: `removed label "${label.name}" from card "${card.title}"`,
  });

  return { message: 'Label removed from card successfully.' };
};

export default {
  createLabelForBoard,
  getLabelsForBoard,
  updateLabel,
  deleteLabel,
  addLabelToCard,
  removeLabelFromCard,
};