import { body } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

/**
 * Validator for the column creation route.
 * This is used for POST /api/boards/:boardId/columns
 * Ensures the column has a title. The position is handled by the service.
 */
export const createColumnValidator = [
  // title: Must be a non-empty string with at least 2 characters.
  body('title')
    .trim()
    .notEmpty().withMessage('Column title is required.')
    .isLength({ min: 2 }).withMessage('Column title must be at least 2 characters long.'),

  // This middleware runs after the validation checks.
  handleValidationErrors,
];

/**
 * Validator for the column update route.
 * This is used for PUT /api/columns/:id
 * Validates title and position fields only if they are provided.
 */
export const updateColumnValidator = [
  // title: If provided, it must meet the length requirements.
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Column title cannot be empty.')
    .isLength({ min: 2 }).withMessage('Column title must be at least 2 characters long.'),
  
  // position: If provided, it must be a valid, non-negative integer.
  body('position')
    .optional()
    .isInt({ min: 0 }).withMessage('Position must be a non-negative integer.'),
    
  handleValidationErrors,
];

/**
 * Validator for moving a column.
 * This is used for POST /api/columns/:id/move
 * Ensures a valid new position is provided.
 */
export const moveColumnValidator = [
  // newPosition: Must exist (even if it's 0) and be a non-negative integer.
  body('newPosition')
    .exists({ checkFalsy: true }).withMessage('A newPosition is required.')
    .isInt({ min: 0 }).withMessage('The newPosition must be a non-negative integer.'),

  handleValidationErrors,
];