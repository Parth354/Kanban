import { Router } from "express";
import auditLog from "../services/auditLogService.js";
const { getLogs, createLog } =auditLog
const router = Router();

router.get("/:boardId", getLogs);
router.post("/", createLog);

export default router;
