"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_validator_1 = require("../validators/auth.validator");
const responseHandler_1 = require("../../../utils/responseHandler");
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const authService = new auth_service_1.AuthService();
class AuthController {
    async login(req, res, next) {
        try {
            await (0, validation_middleware_1.validateRequest)(req, auth_validator_1.loginSchema);
            const result = await authService.login(req.body);
            return responseHandler_1.responseHandler.success(res, result, 'Login successful');
        }
        catch (error) {
            return next(error);
        }
    }
    async register(req, res, next) {
        try {
            await (0, validation_middleware_1.validateRequest)(req, auth_validator_1.registerSchema);
            const result = await authService.register(req.body);
            return responseHandler_1.responseHandler.created(res, result, 'Registration successful');
        }
        catch (error) {
            return next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            await (0, validation_middleware_1.validateRequest)(req, auth_validator_1.refreshTokenSchema);
            const result = await authService.refreshToken(req.body.refreshToken);
            return responseHandler_1.responseHandler.success(res, result, 'Token refreshed successfully');
        }
        catch (error) {
            return next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            await (0, validation_middleware_1.validateRequest)(req, auth_validator_1.forgotPasswordSchema);
            const result = await authService.forgotPassword(req.body.email);
            return responseHandler_1.responseHandler.success(res, result, result.message);
        }
        catch (error) {
            return next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            await (0, validation_middleware_1.validateRequest)(req, auth_validator_1.resetPasswordSchema);
            const result = await authService.resetPassword(req.body.token, req.body.newPassword);
            return responseHandler_1.responseHandler.success(res, result, result.message);
        }
        catch (error) {
            return next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                return responseHandler_1.responseHandler.error(res, 'User not authenticated', 401, 'AUTH_008');
            }
            const result = await authService.logout(userId);
            return responseHandler_1.responseHandler.success(res, result, result.message);
        }
        catch (error) {
            return next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.sub;
            if (!userId) {
                return responseHandler_1.responseHandler.error(res, 'User not authenticated', 401, 'AUTH_008');
            }
            // This would typically fetch full profile from UserService
            // For now, return the token payload data
            const user = req.user;
            return responseHandler_1.responseHandler.success(res, user, 'Profile retrieved successfully');
        }
        catch (error) {
            return next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map