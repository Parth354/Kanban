import asyncHandler from '../middleware/asyncHandler.js';
import commentService from '../services/commentService.js';

export const addCommentToCard = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const comment = await commentService.addComment(req.params.cardId, text, req.user.id);
    res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req, res) => {
    const result = await commentService.deleteComment(req.params.id, req.user.id);
    res.status(200).json(result);
});