import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare const errorHandler: (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=errors.d.ts.map