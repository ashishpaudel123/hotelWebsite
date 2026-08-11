"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return tokens
 * @access  Public
 */
router.post('/login', (req, res, next) => auth_controller_1.authController.login(req, res, next));
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res, next) => auth_controller_1.authController.register(req, res, next));
/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => auth_controller_1.authController.refreshToken(req, res, next));
/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 */
router.post('/forgot-password', (req, res, next) => auth_controller_1.authController.forgotPassword(req, res, next));
/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', (req, res, next) => auth_controller_1.authController.resetPassword(req, res, next));
/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private
 */
router.post('/logout', auth_middleware_1.authenticate, (req, res, next) => auth_controller_1.authController.logout(req, res, next));
/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth_middleware_1.authenticate, (req, res, next) => auth_controller_1.authController.getProfile(req, res, next));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map