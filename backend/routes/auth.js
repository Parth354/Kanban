import { Router } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile
} from "../controllers/authController.js"; 

// Import middleware and validators as before
import { protect } from '../middleware/auth.js';
import { loginValidator, registerValidator } from "../validators/authValidators.js";

const router = Router();

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", registerValidator, registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginValidator, loginUser);

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
// NOTE: Logout doesn't strictly need the 'protect' middleware if it only relies on the refresh token cookie,
// but it's good practice to ensure an access token is also present for consistency.
router.post("/logout", logoutUser);

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token cookie)
router.post("/refresh", refreshAccessToken);

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get("/profile", protect, getUserProfile);

export default router;