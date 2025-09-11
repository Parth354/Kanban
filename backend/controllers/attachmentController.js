import asyncHandler from '../middleware/asyncHandler.js';
import attachmentService from '../services/attachmentService.js';

export const addAttachmentToCard = asyncHandler(async (req, res) => {
    const attachment = await attachmentService.addAttachment(req.params.cardId, req.user.id, req.body);
    res.status(201).json(attachment);
});

export const removeAttachment = asyncHandler(async (req, res) => {
    const result = await attachmentService.removeAttachment(req.params.id, req.user.id);
    res.status(200).json(result);
});