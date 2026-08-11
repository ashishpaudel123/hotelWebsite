import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    login(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    register(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    logout(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map