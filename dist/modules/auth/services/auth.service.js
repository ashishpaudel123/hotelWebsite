"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const auth_repository_1 = require("../repositories/auth.repository");
const logger_1 = require("../../../utils/logger");
const errors_1 = require("../../../utils/errors");
const logger = new logger_1.Logger('AuthService');
class AuthService {
    authRepository;
    JWT_SECRET;
    JWT_EXPIRES_IN;
    REFRESH_TOKEN_SECRET;
    REFRESH_TOKEN_EXPIRES_IN;
    constructor() {
        this.authRepository = new auth_repository_1.AuthRepository();
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error('REFRESH_TOKEN_SECRET environment variable is required');
        }
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
        this.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    }
    async login(dto) {
        const { email, password } = dto;
        // Find user
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            logger.warn('Login attempt with non-existent email', { email });
            throw new errors_1.AppError('Invalid credentials', 401, 'AUTH_001');
        }
        // Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            logger.warn('Login attempt on locked account', { email, lockUntil: user.lockUntil });
            throw new errors_1.AppError('Account temporarily locked. Try again later.', 403, 'AUTH_003');
        }
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            await this.authRepository.incrementLoginAttempts(user._id.toString());
            logger.warn('Invalid password attempt', { email });
            throw new errors_1.AppError('Invalid credentials', 401, 'AUTH_001');
        }
        // Get user permissions
        const permissions = await this.authRepository.getUserPermissions(user._id.toString());
        // Generate tokens
        const accessToken = this.generateAccessToken(user._id.toString(), user.email, user.role?.slug || 'customer', permissions);
        const refreshToken = this.generateRefreshToken(user._id.toString());
        // Update user
        await this.authRepository.resetLoginAttempts(user._id.toString());
        await this.authRepository.updateRefreshToken(user._id.toString(), refreshToken);
        logger.info('User logged in successfully', { userId: user._id, email });
        return {
            accessToken,
            refreshToken,
            expiresIn: parseInt(this.JWT_EXPIRES_IN) * 60, // Convert minutes to seconds
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role?.slug || 'customer',
                permissions,
            },
        };
    }
    async register(dto) {
        const { firstName, lastName, email, password, phone } = dto;
        // Check if user already exists
        const existingUser = await this.authRepository.findByEmail(email);
        if (existingUser) {
            logger.warn('Registration attempt with existing email', { email });
            throw new errors_1.AppError('Email already registered', 409, 'AUTH_002');
        }
        // Get default role
        const defaultRole = await this.authRepository.findDefaultUserRole();
        if (!defaultRole) {
            logger.error('Default customer role not found');
            throw new errors_1.AppError('System configuration error', 500, 'SYS_001');
        }
        // Create user (password will be hashed by model pre-save hook)
        const user = await this.authRepository.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: defaultRole._id,
            status: 'active',
        });
        // Get permissions
        const permissions = await this.authRepository.getUserPermissions(user._id.toString());
        // Generate tokens
        const accessToken = this.generateAccessToken(user._id.toString(), user.email, defaultRole.slug, permissions);
        const refreshToken = this.generateRefreshToken(user._id.toString());
        await this.authRepository.updateRefreshToken(user._id.toString(), refreshToken);
        logger.info('User registered successfully', { userId: user._id, email });
        return {
            accessToken,
            refreshToken,
            expiresIn: parseInt(this.JWT_EXPIRES_IN) * 60,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: defaultRole.slug,
                permissions,
            },
        };
    }
    async refreshToken(refreshToken) {
        let payload;
        try {
            payload = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            logger.warn('Invalid refresh token', { error });
            throw new errors_1.AppError('Invalid refresh token', 401, 'AUTH_004');
        }
        const user = await this.authRepository.findById(payload.sub);
        if (!user) {
            logger.warn('User not found for refresh token', { userId: payload.sub });
            throw new errors_1.AppError('User not found', 404, 'AUTH_005');
        }
        if (!user.refreshToken || user.refreshToken !== refreshToken) {
            logger.warn('Refresh token mismatch or reused', { userId: user._id });
            await this.authRepository.updateRefreshToken(user._id.toString(), null);
            throw new errors_1.AppError('Invalid refresh token', 401, 'AUTH_004');
        }
        const permissions = await this.authRepository.getUserPermissions(user._id.toString());
        const newRefreshToken = this.generateRefreshToken(user._id.toString());
        await this.authRepository.updateRefreshToken(user._id.toString(), newRefreshToken);
        const accessToken = this.generateAccessToken(user._id.toString(), user.email, user.role?.slug || 'customer', permissions);
        logger.debug('Access token refreshed', { userId: user._id });
        return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: parseInt(this.JWT_EXPIRES_IN) * 60,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role?.slug || 'customer',
                permissions,
            },
        };
    }
    async forgotPassword(email) {
        const user = await this.authRepository.findByEmail(email);
        // Always return success message to prevent email enumeration
        if (!user) {
            logger.debug('Forgot password requested for non-existent email', { email });
            return { message: 'If the email exists, a reset link has been sent' };
        }
        await this.authRepository.createPasswordResetToken(user._id.toString());
        logger.info('Password reset token created', { userId: user._id, email });
        return { message: 'If the email exists, a reset link has been sent' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.authRepository.findUserByResetToken(token);
        if (!user) {
            logger.warn('Invalid or expired reset token', { token });
            throw new errors_1.AppError('Invalid or expired reset token', 400, 'AUTH_006');
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        // Update password and clear reset token
        await this.authRepository.updatePassword(user._id.toString(), hashedPassword);
        await this.authRepository.clearPasswordResetToken(user._id.toString());
        logger.info('Password reset successfully', { userId: user._id });
        return { message: 'Password reset successfully' };
    }
    async logout(userId) {
        await this.authRepository.updateRefreshToken(userId, null);
        logger.info('User logged out', { userId });
        return { message: 'Logged out successfully' };
    }
    generateAccessToken(userId, email, role, permissions) {
        const payload = {
            sub: userId,
            email,
            role,
            permissions,
        };
        return jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        });
    }
    generateRefreshToken(userId) {
        const payload = { sub: userId };
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        });
    }
    verifyToken(token) {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        }
        catch (error) {
            logger.error('Token verification failed', { error });
            throw new errors_1.AppError('Invalid token', 401, 'AUTH_007');
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map