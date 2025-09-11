import { validationResult } from 'express-validator';

/**
 * Express middleware that checks for validation errors collected by express-validator.
 * 
 * If errors are found, it sends a 400 Bad Request response with the errors.
 * If no errors are found, it passes control to the next middleware in the stack.
 * 
 * This should be the last item in any validation chain array.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const handleValidationErrors = (req, res, next) => {
  // Get the validation result from the request object.
  const errors = validationResult(req);

  // Check if the errors array is not empty.
  if (!errors.isEmpty()) {
    // If there are errors, stop the request and send a 400 response.
    // .array() formats the errors into a clean array of objects.
    return res.status(400).json({ errors: errors.array() });
  }

  // If there are no errors, call next() to move to the next middleware (usually the controller).
  next();
};

export default handleValidationErrors;