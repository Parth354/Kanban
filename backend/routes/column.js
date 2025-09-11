import { Router } from "express";
import { protect } from "../middleware/auth.js";

// Import CONTROLLERS
import { updateColumn, deleteColumn, moveColumn } from "../controllers/columnController.js";

// Import VALIDATORS
import { updateColumnValidator, moveColumnValidator } from "../validators/columnValidators.js";

const router = Router();
router.use(protect);

router.route("/:id")
    .put(updateColumnValidator, updateColumn)
    .delete(deleteColumn);

router.route("/:id/move")
    .post(moveColumnValidator, moveColumn);

export default router;