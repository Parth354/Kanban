import { Router } from "express";
import { protect } from "../middleware/auth.js";

import {
    getBoards,
    createBoard,
    getBoardById,
    updateBoard,
    deleteBoard,
    getBoardMembers,
    addBoardMember,
    updateMemberRole,
    removeMember
} from "../controllers/boardController.js";
import { getColumnsByBoard, createColumnForBoard } from "../controllers/columnController.js";
import { getBoardAuditLogs } from "../controllers/auditLogController.js";

// Import VALIDATORS
import { createBoardValidator, updateBoardValidator, addMemberValidator } from "../validators/boardValidators.js";
import { createColumnValidator } from "../validators/columnValidators.js";

const router = Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// --- Board Routes ---
router.route("/")
    .get(getBoards)
    .post(createBoardValidator, createBoard);

router.route("/:id")
    .get(getBoardById)
    .put(updateBoardValidator, updateBoard)
    .delete(deleteBoard);

// --- Nested Member Routes ---
router.route("/:id/members")
    .get(getBoardMembers)
    .post(addMemberValidator, addBoardMember);

router.route("/:id/members/:userId")
    .put(updateMemberRole) // Assuming a simple controller, no complex validation needed here
    .delete(removeMember);

// --- Nested Column Routes ---
router.route("/:boardId/columns")
    .get(getColumnsByBoard)
    .post(createColumnValidator, createColumnForBoard);

// --- Nested Audit Log Routes ---
router.route("/:boardId/audit-logs")
    .get(getBoardAuditLogs);

export default router;