import { Router } from "express";
import columnService from "../services/columnService.js";
const { getColumns, createColumn, updateColumn, deleteColumn } = columnService
const router = Router();

router.get("/:boardId", getColumns);
router.post("/", createColumn);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);

export default router;
