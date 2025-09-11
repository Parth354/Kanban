// File: backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import { User } from '../models/index.js'; // It should only import the model

/**
 * Middleware to protect routes that require authentication.
 * It verifies the JWT from the Authorization header.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGciOiJIUz...")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by the ID from the token payload and attach it to the request.
      // Exclude the password hash for security.
      req.user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error('TOKEN VERIFICATION ERROR:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

/**
 * Middleware to restrict access to admin users.
 * This should be used AFTER the 'protect' middleware.
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403); // 403 Forbidden is more appropriate than 401 Unauthorized
    throw new Error('Not authorized as an admin');
  }
};