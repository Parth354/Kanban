import { Router } from "express";
import cardService from "../services/cardService.js";
const { getCards, createCard, updateCard, deleteCard } = cardService;
const router = Router();

router.get("/:columnId", getCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

export default router;
