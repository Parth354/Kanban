import { body } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

/**
 * Validator for the board creation route.
 * Ensures that a board has a valid title.
 */
export const createBoardValidator = [
  // title: Must be a non-empty string with at least 3 characters.
  body('title')
    .trim()
    .notEmpty().withMessage('Board title is required.')
    .isLength({ min: 3 }).withMessage('Board title must be at least 3 characters long.'),
  
  // visibility: If provided, must be one of the allowed values.
  body('visibility')
    .optional()
    .isIn(['private', 'team', 'public']).withMessage('Invalid visibility value. Must be one of: private, team, public.'),
    
  // projectId: If provided, must be a valid UUID.
  body('projectId')
    .optional()
    .isUUID().withMessage('A valid project ID must be provided.'),

  handleValidationErrors,
];

/**
 * Validator for the board update route.
 * Validates fields only if they are provided in the request.
 */
export const updateBoardValidator = [
  // title: If provided, must be at least 3 characters long.
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Board title cannot be an empty string.')
    .isLength({ min: 3 }).withMessage('Board title must be at least 3 characters long.'),

  // visibility: If provided, must be one of the allowed values.
  body('visibility')
    .optional()
    .isIn(['private', 'team', 'public']).withMessage('Invalid visibility value. Must be one of: private, team, public.'),

  handleValidationErrors,
];

/**
 * Validator for adding a member to a board.
 * This is used for the POST /api/boards/:id/members route.
 * Ensures a valid user ID is provided.
 */
export const addMemberValidator = [
  // newUserId: Must be a non-empty string and a valid UUID.
  body('newUserId')
    .notEmpty().withMessage('The ID of the user to add is required.')
    .isUUID().withMessage('A valid user ID must be provided.'),

  handleValidationErrors,
];