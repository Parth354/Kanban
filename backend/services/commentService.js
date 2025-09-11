import { Comment } from '../models/index.js';
import { checkBoardMembership } from './boardService.js';

const addComment = async (cardId, text, authorId) => {
  const card = await Card.findByPk(cardId);
  if (!card) throw new Error('Card not found.');
  await checkBoardMembership(card.boardId, authorId);

  return await Comment.create({ cardId, text, authorId });
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findByPk(commentId, { include: [Card] });
  if (!comment) throw new Error('Comment not found.');

  const member = await checkBoardMembership(comment.card.boardId, userId);
  
  // Allow deletion if user is the author or a board admin
  if (comment.authorId !== userId && member.role !== 'admin') {
    throw new Error('Forbidden: You can only delete your own comments.');
  }

  await comment.destroy();
  return { message: 'Comment deleted successfully.' };
};

export default { addComment, deleteComment };