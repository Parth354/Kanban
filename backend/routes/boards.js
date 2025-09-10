const express = require("express");
const { getBoards, createBoard, getBoardById, deleteBoard } = require("../services/boardService");
const router = express.Router();

router.get("/", getBoards);
router.post("/", createBoard);
router.get("/:id", getBoardById);
router.delete("/:id", deleteBoard);

module.exports = router;
