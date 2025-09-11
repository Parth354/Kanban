import { Router } from "express";
import { protect } from "../middleware/auth.js";

// Import CONTROLLER
import { deleteComment } from "../controllers/commentController.js";

const router = Router();
router.use(protect);

// @desc    Delete a comment by its own ID
// @route   DELETE /api/comments/:id
router.route("/:id")
    .delete(deleteComment);

export default router;