import { Response } from 'express';
interface Meta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
}
export declare const responseHandler: {
    success(res: Response, data: any, message?: string, statusCode?: number, meta?: Meta): Response<any, Record<string, any>>;
    created(res: Response, data: any, message?: string, meta?: Meta): Response<any, Record<string, any>>;
    error(res: Response, message: string, statusCode?: number, code?: string, details?: any[]): Response<any, Record<string, any>>;
    notFound(res: Response, resource?: string): Response<any, Record<string, any>>;
    unauthorized(res: Response, message?: string): Response<any, Record<string, any>>;
    forbidden(res: Response, message?: string): Response<any, Record<string, any>>;
    validation(res: Response, details: any[]): Response<any, Record<string, any>>;
    conflict(res: Response, message?: string): Response<any, Record<string, any>>;
    serverError(res: Response, message?: string): Response<any, Record<string, any>>;
};
export {};
//# sourceMappingURL=responseHandler.d.ts.map