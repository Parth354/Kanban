import { Router } from "express";
import { protect } from "../middleware/auth.js";

// Import CONTROLLERS
import {
    getCardDetails,
    updateCard,
    createCard, // Don't forget createCard if you have a POST /api/cards route
    deleteCard,
    moveCard,
    assignUserToCard
} from "../controllers/cardController.js";
import { addCommentToCard } from "../controllers/commentController.js";
import { addAttachmentToCard } from "../controllers/attachmentController.js";
import { addLabelToCard, removeLabelFromCard } from "../controllers/labelController.js";

// Import VALIDATORS
import { createCardValidator, updateCardValidator, moveCardValidator, assignUserValidator } from "../validators/cardValidators.js";

const router = Router();
router.use(protect);

// This route handles creation of a new card
router.route("/")
    .post(createCardValidator, createCard);

// These routes handle a specific card by its ID
router.route("/:id")
    .get(getCardDetails)
    .put(updateCardValidator, updateCard)
    .delete(deleteCard);

router.route("/:id/move")
    .post(moveCardValidator, moveCard);

router.route("/:id/assign")
    .post(assignUserValidator, assignUserToCard);

// --- Nested Routes for a specific card ---

router.route("/:cardId/comments")
    .post(addCommentToCard); // Assuming simple validation for now

router.route("/:cardId/attachments")
    .post(addAttachmentToCard); // Add validation if needed

router.route("/:cardId/labels")
    .post(addLabelToCard); // Add validation if needed

router.route("/:cardId/labels/:labelId")
    .delete(removeLabelFromCard);

export default router;