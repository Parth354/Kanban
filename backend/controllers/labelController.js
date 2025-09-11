import asyncHandler from '../middleware/asyncHandler.js';
import labelService from '../services/labelService.js';

export const addLabelToCard = asyncHandler(async (req, res) => {
    const { labelId } = req.body;
    const result = await labelService.addLabelToCard(req.params.cardId, labelId, req.user.id);
    res.status(201).json(result);
});

export const removeLabelFromCard = asyncHandler(async (req, res) => {
    const { cardId, labelId } = req.params;
    const result = await labelService.removeLabelFromCard(cardId, labelId, req.user.id);
    res.status(200).json(result);
});