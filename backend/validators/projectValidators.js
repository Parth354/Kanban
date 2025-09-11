import { body } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

/**
 * Validator for the project creation route.
 * Ensures that a project has a valid name.
 */
export const createProjectValidator = [
  // name: Must be a non-empty string with at least 3 characters.
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required.')
    .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters long.'),

  // This middleware runs after the above checks and handles any collected errors.
  handleValidationErrors,
];


/**
 * Validator for the project update route.
 * Validates the name field only if it is provided in the request.
 */
export const updateProjectValidator = [
  // name: If provided, it must not be empty and must be at least 3 characters long.
  body('name')
    .optional() // This makes the validation run only if 'name' is in the request body.
    .trim()
    .notEmpty().withMessage('Project name cannot be an empty string.')
    .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters long.'),

  handleValidationErrors,
];