import asyncHandler from '../middleware/asyncHandler.js';
import auditLogService from '../services/auditLogService.js';

/**
 * Controller to handle fetching audit logs for a specific board.
 * This function is called by the route handler.
 * @route GET /api/boards/:boardId/audit-logs
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
export const getBoardAuditLogs = asyncHandler(async (req, res) => {
  // Extract the boardId from the URL parameters.
  const { boardId } = req.params;
  
  // Extract the current user's ID from the request object (added by the 'protect' middleware).
  const userId = req.user.id;

  // Call the service function to fetch the logs.
  const logs = await auditLogService.getLogsByBoard(boardId, userId);
  
  // Send a 200 OK response with the fetched logs.
  res.status(200).json(logs);
});