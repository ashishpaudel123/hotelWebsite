import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));

export default router;
