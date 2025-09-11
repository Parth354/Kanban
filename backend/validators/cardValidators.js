import { body, param } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

/**
 * Validator for the card creation route.
 * This is used for POST /api/columns/:columnId/cards (or a similar route).
 */
export const createCardValidator = [
  // title: Must be a non-empty string with at least 2 characters.
  body('title')
    .trim()
    .notEmpty().withMessage('Card title is required.')
    .isLength({ min: 2 }).withMessage('Card title must be at least 2 characters long.'),

  // columnId: Must be a non-empty string and a valid UUID.
  body('columnId')
    .notEmpty().withMessage('Column ID is required.')
    .isUUID().withMessage('Invalid Column ID format.'),

  // boardId: Must be a non-empty string and a valid UUID.
  body('boardId')
    .notEmpty().withMessage('Board ID is required.')
    .isUUID().withMessage('Invalid Board ID format.'),

  handleValidationErrors,
];

/**
 * Validator for updating a card's details.
 * This is used for PUT /api/cards/:id
 * All fields are optional, but if provided, they must be valid.
 */
export const updateCardValidator = [
  // title: If provided, must not be empty and must be at least 2 characters long.
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Card title cannot be an empty string.')
    .isLength({ min: 2 }).withMessage('Card title must be at least 2 characters long.'),

  // description: If provided, must be a string.
  body('description')
    .optional()
    .isString().withMessage('Description must be a string.'),

  // priority: If provided, must be one of the allowed ENUM values.
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value. Must be one of: low, medium, high.'),

  // due_date: If provided, must be a valid ISO 8601 date format. Can be null to clear the date.
  body('due_date')
    .optional({ nullable: true }) // Allows the value to be `null`.
    .isISO8601().withMessage('Due date must be a valid date (YYYY-MM-DD).'),

  handleValidationErrors,
];

/**
 * Validator for moving a card to a new position or column.
 * This is used for POST /api/cards/:id/move
 */
export const moveCardValidator = [
  // newColumnId: Must be a non-empty string and a valid UUID.
  body('newColumnId')
    .notEmpty().withMessage('New column ID is required.')
    .isUUID().withMessage('Invalid new column ID format.'),

  // newPosition: Must exist and be a non-negative integer.
  body('newPosition')
    .exists({ checkFalsy: true }).withMessage('A newPosition is required (can be 0).')
    .isInt({ min: 0 }).withMessage('Position must be a non-negative integer.'),

  handleValidationErrors,
];

/**
 * Validator for assigning a user to a card.
 * This is used for POST /api/cards/:id/assign
 */
export const assignUserValidator = [
  // assigneeId: Can be a valid UUID or null (to unassign).
  body('assigneeId')
    .optional({ nullable: true }) // Allows the field to be omitted or be `null`.
    .isUUID().withMessage('Assignee ID must be a valid UUID if provided.'),

  handleValidationErrors,
];