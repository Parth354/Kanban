import { Attachment, Card, User } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';
import auditLogService from './auditLogService.js';

/**
 * Adds an attachment record to a card.
 * NOTE: This service does not handle the file upload itself. It only creates
 * the database record after a file has been uploaded to a storage service (e.g., S3, Cloudinary).
 * @param {string} cardId - The ID of the card to attach the file to.
 * @param {string} uploaderId - The ID of the user uploading the file.
 * @param {object} attachmentData - Contains file details.
 * @param {string} attachmentData.file_name - The original name of the file.
 * @param {string} attachmentData.file_url - The URL where the file is stored.
 * @param {string} attachmentData.file_type - The MIME type of the file.
 * @returns {Promise<Attachment>} The newly created attachment record.
 */
const addAttachment = async (cardId, uploaderId, attachmentData) => {
  const card = await Card.findByPk(cardId);
  if (!card) {
    const error = new Error('Card not found.');
    error.statusCode = 404;
    throw error;
  }

  // Security Check: Ensure the uploader is a member of the board.
  await checkBoardMembership(card.boardId, uploaderId);

  const attachment = await Attachment.create({
    ...attachmentData,
    cardId,
    uploaderId,
  });

  // Log this action
  await auditLogService.createLog({
    boardId: card.boardId,
    userId: uploaderId,
    action: `added attachment "${attachment.file_name}" to card "${card.title}"`,
  });

  return attachment;
};

/**
 * Removes an attachment record from a card.
 * NOTE: This does not delete the file from the cloud storage provider.
 * @param {string} attachmentId - The ID of the attachment to remove.
 * @param {string} userId - The ID of the user attempting to remove the attachment.
 * @returns {Promise<{message: string}>} A success message.
 */
const removeAttachment = async (attachmentId, userId) => {
  const attachment = await Attachment.findByPk(attachmentId, {
    include: [{ model: Card, attributes: ['id', 'boardId', 'title'] }],
  });

  if (!attachment) {
    const error = new Error('Attachment not found.');
    error.statusCode = 404;
    throw error;
  }

  const { card } = attachment;

  // Security Check: Ensure the user is a member of the board.
  const member = await checkBoardMembership(card.boardId, userId);

  // Permission Check: User must be the original uploader or a board admin.
  if (attachment.uploaderId !== userId && member.role !== 'admin') {
    const error = new Error('Forbidden: You can only delete your own attachments or must be a board admin.');
    error.statusCode = 403;
    throw error;
  }

  // Store details for the audit log before destroying the object.
  const logDetails = {
    fileName: attachment.file_name,
    cardTitle: card.title,
    boardId: card.boardId,
  };

  await attachment.destroy();

  // Log this action
  await auditLogService.createLog({
    boardId: logDetails.boardId,
    userId: userId,
    action: `removed attachment "${logDetails.fileName}" from card "${logDetails.cardTitle}"`,
  });

  return { message: 'Attachment removed successfully.' };
};

export default { addAttachment, removeAttachment };