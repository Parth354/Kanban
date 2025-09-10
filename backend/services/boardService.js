const Board = require("../models/Board");

async function getBoards(req, res) {
  try {
    const boards = await Board.findAll();
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch boards" });
  }
}

async function getBoardById(req, res) {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board) return res.status(404).json({ error: "Board not found" });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch board" });
  }
}

async function createBoard(req, res) {
  try {
    const { title, ownerId } = req.body;
    const board = await Board.create({ title, ownerId });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: "Failed to create board" });
  }
}

async function deleteBoard(req, res) {
  try {
    const deleted = await Board.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Board not found" });
    res.json({ message: "Board deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete board" });
  }
}

module.exports = { getBoards, getBoardById, createBoard, deleteBoard };
