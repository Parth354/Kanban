import asyncHandler from '../middleware/asyncHandler.js';
import * as boardService from '../services/boardService.js';

// @desc    Get boards for a user
// @route   GET /api/boards
export const getBoards = asyncHandler(async (req, res) => {
  const boards = await boardService.getBoards(req.user.id, req.query.projectId);
  res.status(200).json(boards);
});

// @desc    Get a single board by ID
// @route   GET /api/boards/:id
export const getBoardById = asyncHandler(async (req, res) => {
  const board = await boardService.getBoardById(req.params.id, req.user.id);
  res.status(200).json(board);
});

// @desc    Create a new board
// @route   POST /api/boards
export const createBoard = asyncHandler(async (req, res) => {
  const board = await boardService.createBoard(req.body, req.user.id);
  res.status(201).json(board);
});

// @desc    Update a board
// @route   PUT /api/boards/:id
export const updateBoard = asyncHandler(async (req, res) => {
  const board = await boardService.updateBoard(req.params.id, req.body, req.user.id);
  res.status(200).json(board);
});

// @desc    Delete a board
// @route   DELETE /api/boards/:id
export const deleteBoard = asyncHandler(async (req, res) => {
  const result = await boardService.deleteBoard(req.params.id, req.user.id);
  res.status(200).json(result);
});

// @desc    Get members of a board
// @route   GET /api/boards/:id/members
export const getBoardMembers = asyncHandler(async (req, res) => {
    const members = await boardService.getBoardMembers(req.params.id, req.user.id);
    res.status(200).json(members);
});

// @desc    Add a member to a board
// @route   POST /api/boards/:id/members
export const addBoardMember = asyncHandler(async (req, res) => {
    const { newUserId } = req.body;
    const member = await boardService.addBoardMember(req.params.id, newUserId, req.user.id);
    res.status(201).json(member);
});

// @desc    Update a member's role
// @route   PUT /api/boards/:id/members/:userId
export const updateMemberRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const member = await boardService.updateMemberRole(req.params.id, req.params.userId, role, req.user.id);
    res.status(200).json(member);
});

// @desc    Remove a member from a board
// @route   DELETE /api/boards/:id/members/:userId
export const removeMember = asyncHandler(async (req, res) => {
    const result = await boardService.removeMember(req.params.id, req.params.userId, req.user.id);
    res.status(200).json(result);
});