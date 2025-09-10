const Card = require("../models/Card");

async function getCards(req, res) {
  try {
    const cards = await Card.findAll({ where: { columnId: req.params.columnId } });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cards" });
  }
}

async function createCard(req, res) {
  try {
    const { columnId, assigneeId, title, description, position } = req.body;
    const card = await Card.create({ columnId, assigneeId, title, description, position });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ error: "Failed to create card" });
  }
}

async function updateCard(req, res) {
  try {
    const { title, description, position, assigneeId } = req.body;
    const updated = await Card.update(
      { title, description, position, assigneeId },
      { where: { id: req.params.id }, returning: true }
    );
    if (!updated[0]) return res.status(404).json({ error: "Card not found" });
    res.json(updated[1][0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update card" });
  }
}

async function deleteCard(req, res) {
  try {
    const deleted = await Card.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Card not found" });
    res.json({ message: "Card deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete card" });
  }
}

module.exports = { getCards, createCard, updateCard, deleteCard };
