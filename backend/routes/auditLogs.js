const express = require("express");
const { getLogs, createLog } = require("../services/auditLogService");
const router = express.Router();

router.get("/:boardId", getLogs);
router.post("/", createLog);

module.exports = router;
