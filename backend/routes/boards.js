import { Router } from "express";
import s from "../services/boardService.js";
const { getBoards, createBoard, getBoardById, deleteBoard } =s;
const router = Router();

router.get("/", getBoards);
router.post("/", createBoard);
router.get("/:id", getBoardById);
router.delete("/:id", deleteBoard);

export default router;
