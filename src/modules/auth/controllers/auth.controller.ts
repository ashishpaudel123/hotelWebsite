import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, registerSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { responseHandler } from '../../../utils/responseHandler';
import { validateRequest } from '../../../middleware/validation.middleware';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      await validateRequest(req, loginSchema);
      const result = await authService.login(req.body);
      return responseHandler.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      await validateRequest(req, registerSchema);
      const result = await authService.register(req.body);
      return responseHandler.created(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      await validateRequest(req, refreshTokenSchema);
      const result = await authService.refreshToken(req.body.refreshToken);
      return responseHandler.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await validateRequest(req, forgotPasswordSchema);
      const result = await authService.forgotPassword(req.body.email);
      return responseHandler.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await validateRequest(req, resetPasswordSchema);
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      return responseHandler.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return responseHandler.error(res, 'User not authenticated', 401, 'AUTH_008');
      }
      
      const result = await authService.logout(userId);
      return responseHandler.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        return responseHandler.error(res, 'User not authenticated', 401, 'AUTH_008');
      }

      // This would typically fetch full profile from UserService
      // For now, return the token payload data
      const user = (req as any).user;
      return responseHandler.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
