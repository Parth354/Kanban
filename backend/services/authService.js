import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';

const generateTokens = async (user) => {
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshTokenValue = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Invalidate any old refresh tokens for this user
    await RefreshToken.destroy({ where: { userId: user.id } });

    // Store the new refresh token in the database
    await RefreshToken.create({
        token: refreshTokenValue,
        userId: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    return { accessToken, refreshToken: refreshTokenValue };
};

const registerUser = async (userData) => {
    const { name, email, password } = userData;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        const error = new Error('User with this email already exists.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash });

    // Return a clean user object without the password hash
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
};

const loginUser = async (loginData) => {
    const { email, password } = loginData;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        const error = new Error('Invalid email or password.');
        error.statusCode = 401; // Unauthorized
        throw error;
    }

    const tokens = await generateTokens(user);

    return {
        ...tokens,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        }
    };
};

const logoutUser = async (refreshToken) => {
    if (!refreshToken) {
        return { message: 'No refresh token provided.' };
    }
    const deletedCount = await RefreshToken.destroy({ where: { token: refreshToken } });
    if (deletedCount === 0) {
        throw new Error('Invalid refresh token.');
    }
    return { message: 'Logged out successfully.' };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        const error = new Error('Refresh token is required.');
        error.statusCode = 401;
        throw error;
    }

    const tokenRecord = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
        const error = new Error('Refresh token is invalid or expired.');
        error.statusCode = 403; // Forbidden
        throw error;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

    return { accessToken: newAccessToken };
};


const getUserProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
    });
    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }
    return user;
};


export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfile
};