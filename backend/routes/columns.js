const express = require("express");
const { getColumns, createColumn, updateColumn, deleteColumn } = require("../services/columnService");
const router = express.Router();

router.get("/:boardId", getColumns);
router.post("/", createColumn);
router.put("/:id", updateColumn);
router.delete("/:id", deleteColumn);

module.exports = router;
