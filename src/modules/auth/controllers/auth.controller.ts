import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";
import { responseHandler } from "../../../utils/responseHandler";
import { validateRequest } from "../../../middleware/validation.middleware";

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await validateRequest(req, loginSchema);
      const result = await authService.login(req.body);
      responseHandler.success(res, result, "Login successful");
    } catch (error) {
      return next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await validateRequest(req, registerSchema);
      const result = await authService.register(req.body);
      responseHandler.created(res, result, "Registration successful");
    } catch (error) {
      return next(error);
    }
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await validateRequest(req, refreshTokenSchema);
      const result = await authService.refreshToken(req.body.refreshToken);
      responseHandler.success(res, result, "Token refreshed successfully");
    } catch (error) {
      return next(error);
    }
  }

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await validateRequest(req, forgotPasswordSchema);
      const result = await authService.forgotPassword(req.body.email);
      responseHandler.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await validateRequest(req, resetPasswordSchema);
      const result = await authService.resetPassword(
        req.body.token,
        req.body.newPassword,
      );
      responseHandler.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        responseHandler.error(res, "User not authenticated", 401, "AUTH_008");
        return;
      }

      const result = await authService.logout(userId);
      responseHandler.success(res, result, result.message);
    } catch (error) {
      return next(error);
    }
  }

  async getProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.sub;
      if (!userId) {
        responseHandler.error(res, "User not authenticated", 401, "AUTH_008");
        return;
      }

      // This would typically fetch full profile from UserService
      // For now, return the token payload data
      const user = (req as any).user;
      responseHandler.success(res, user, "Profile retrieved successfully");
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();
