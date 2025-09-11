import asyncHandler from '../middleware/asyncHandler.js';
import cardService from '../services/cardService.js';

// @desc    Get full card details
// @route   GET /api/cards/:id
export const getCardDetails = asyncHandler(async (req, res) => {
  const card = await cardService.getCardDetails(req.params.id, req.user.id);
  res.status(200).json(card);
});

// @desc    Create a new card
// @route   POST /api/cards
export const createCard = asyncHandler(async (req, res) => {
  const card = await cardService.createCard(req.body, req.user.id);
  res.status(201).json(card);
});

// @desc    Update a card
// @route   PUT /api/cards/:id
export const updateCard = asyncHandler(async (req, res) => {
  const card = await cardService.updateCard(req.params.id, req.body, req.user.id);
  res.status(200).json(card);
});

// @desc    Delete a card
// @route   DELETE /api/cards/:id
export const deleteCard = asyncHandler(async (req, res) => {
  const result = await cardService.deleteCard(req.params.id, req.user.id);
  res.status(200).json(result);
});

// @desc    Move a card
// @route   POST /api/cards/:id/move
export const moveCard = asyncHandler(async (req, res) => {
  const { newColumnId, newPosition } = req.body;
  const card = await cardService.moveCard(req.params.id, { newColumnId, newPosition }, req.user.id);
  res.status(200).json(card);
});

// @desc    Assign a user to a card
// @route   POST /api/cards/:id/assign
export const assignUserToCard = asyncHandler(async (req, res) => {
  const { assigneeId } = req.body;
  const card = await cardService.assignUserToCard(req.params.id, assigneeId, req.user.id);
  res.status(200).json(card);
});