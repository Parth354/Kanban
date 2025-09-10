const express = require("express");
const { getCards, createCard, updateCard, deleteCard } = require("../services/cardService");
const router = express.Router();

router.get("/:columnId", getCards);
router.post("/", createCard);
router.put("/:id", updateCard);
router.delete("/:id", deleteCard);

module.exports = router;
