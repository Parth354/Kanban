import asyncHandler from '../middleware/asyncHandler.js';
import * as columnService from '../services/columnService.js';

// @desc    Get all columns for a board
// @route   GET /api/boards/:boardId/columns
export const getColumnsByBoard = asyncHandler(async (req, res) => {
  const columns = await columnService.getColumnsByBoard(req.params.boardId, req.user.id);
  res.status(200).json(columns);
});

// @desc    Create a new column
// @route   POST /api/boards/:boardId/columns
export const createColumnForBoard = asyncHandler(async (req, res) => {
  const columnData = { ...req.body, boardId: req.params.boardId };
  const column = await columnService.createColumnForBoard(columnData, req.user.id);
  res.status(201).json(column);
});

// @desc    Update a column
// @route   PUT /api/columns/:id
export const updateColumn = asyncHandler(async (req, res) => {
  const column = await columnService.updateColumn(req.params.id, req.body, req.user.id);
  res.status(200).json(column);
});

// @desc    Delete a column
// @route   DELETE /api/columns/:id
export const deleteColumn = asyncHandler(async (req, res) => {
  const result = await columnService.deleteColumn(req.params.id, req.user.id);
  res.status(200).json(result);
});

// @desc    Move a column
// @route   POST /api/columns/:id/move
export const moveColumn = asyncHandler(async (req, res) => {
  const { newPosition } = req.body;
  const column = await columnService.moveColumn(req.params.id, newPosition, req.user.id);
  res.status(200).json(column);
});