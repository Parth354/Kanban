const Column = require("../models/Column");

async function getColumns(req, res) {
  try {
    const columns = await Column.findAll({ where: { boardId: req.params.boardId } });
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch columns" });
  }
}

async function createColumn(req, res) {
  try {
    const { boardId, title, position } = req.body;
    const column = await Column.create({ boardId, title, position });
    res.status(201).json(column);
  } catch (err) {
    res.status(500).json({ error: "Failed to create column" });
  }
}

async function updateColumn(req, res) {
  try {
    const { title, position } = req.body;
    const updated = await Column.update(
      { title, position },
      { where: { id: req.params.id }, returning: true }
    );
    if (!updated[0]) return res.status(404).json({ error: "Column not found" });
    res.json(updated[1][0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update column" });
  }
}

async function deleteColumn(req, res) {
  try {
    const deleted = await Column.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: "Column not found" });
    res.json({ message: "Column deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete column" });
  }
}

module.exports = { getColumns, createColumn, updateColumn, deleteColumn };
