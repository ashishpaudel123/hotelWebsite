import { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    permissions: string[];
}
declare module 'express' {
    interface Request {
        user?: JwtPayload;
    }
}
export declare const authenticate: (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorize: (...permissions: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const checkRole: (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map