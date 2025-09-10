const AuditLog = require("../models/AuditLog");

async function getLogs(req, res) {
  try {
    const logs = await AuditLog.findAll({
      where: { boardId: req.params.boardId },
      order: [["createdAt", "DESC"]],
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
}

async function createLog(req, res) {
  try {
    const { userId, boardId, action, payload } = req.body;
    const log = await AuditLog.create({ userId, boardId, action, payload });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to create log" });
  }
}

module.exports = { getLogs, createLog };
