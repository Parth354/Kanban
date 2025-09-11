import asyncHandler from '../middleware/asyncHandler.js';
import authService from '../services/authService.js';

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser({ name, email, password });
  res.status(201).json(user);
});

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.loginUser({ email, password });

  // Set refresh token in an HTTP-Only cookie for security
  res.cookie('jwt_refresh', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: THIRTY_DAYS,
  });

  res.status(200).json({ accessToken, user });
});

// @desc    Logout user
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;
  await authService.logoutUser(refreshToken);
  
  // Clear the cookie
  res.cookie('jwt_refresh', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully.' });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token found.');
  }
  const { accessToken } = await authService.refreshAccessToken(refreshToken);
  res.status(200).json({ accessToken });
});

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);
  res.status(200).json(user);
});