import asyncHandler from '../middleware/asyncHandler.js';
import * as cardService from '../services/cardService.js';

export const getCardDetails = asyncHandler(async (req, res) => {
  const card = await cardService.getCardDetails(req.params.id, req.user.id);
  res.status(200).json(card);
});

export const createCard = asyncHandler(async (req, res) => {
  const card = await cardService.createCard(req.body, req.user.id);
  res.status(201).json(card);
});

export const updateCard = asyncHandler(async (req, res) => {
  const card = await cardService.updateCard(req.params.id, req.body, req.user.id);
  res.status(200).json(card);
});

export const deleteCard = asyncHandler(async (req, res) => {
  const result = await cardService.deleteCard(req.params.id, req.user.id);
  res.status(200).json(result);
});

export const moveCard = asyncHandler(async (req, res) => {
  const moveData = {
    newColumnId: req.body.newColumnId,
    newPosition: req.body.newPosition,
  };
  const card = await cardService.moveCard(req.params.id, moveData, req.user.id);
  res.status(200).json(card);
});

export const assignUserToCard = asyncHandler(async (req, res) => {
  const { assigneeId } = req.body;
  const card = await cardService.assignUserToCard(req.params.id, assigneeId, req.user.id);
  res.status(200).json(card);
});