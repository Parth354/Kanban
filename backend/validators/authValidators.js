import { body } from 'express-validator';
import handleValidationErrors from './handleValidationErrors.js';

/**
 * Validator for the user registration route.
 * Checks for name, email, and password requirements.
 */
export const registerValidator = [
  // name: Must be a non-empty string with at least 2 characters.
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),

  // email: Must be a valid email format.
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(), // Sanitizes the email (e.g., converts to lowercase).

  // password: Must be a non-empty string with at least 6 characters.
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),

  // This middleware runs after the above checks and handles any collected errors.
  handleValidationErrors,
];


/**
 * Validator for the user login route.
 * Checks for email and password presence.
 */
export const loginValidator = [
  // email: Must be a valid email format.
  body('email')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  // password: Must not be empty.
  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];