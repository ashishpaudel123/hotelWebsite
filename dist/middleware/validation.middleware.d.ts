import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';
export declare const validateRequest: (req: Request, schema: ZodSchema) => Promise<void>;
export declare const validationMiddleware: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const paginateSchema: {
    page: (defaultPage?: number) => z.ZodDefault<z.ZodNumber>;
    limit: (defaultLimit?: number) => z.ZodDefault<z.ZodNumber>;
    sortBy: (defaultSort?: string) => z.ZodDefault<z.ZodString>;
    sortOrder: () => z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    search: () => z.ZodOptional<z.ZodString>;
    status: () => z.ZodOptional<z.ZodEnum<["active", "inactive", "deleted"]>>;
};
//# sourceMappingURL=validation.middleware.d.ts.map