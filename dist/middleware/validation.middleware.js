"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateSchema = exports.validationMiddleware = exports.validateRequest = void 0;
const zod_1 = require("zod");
const responseHandler_1 = require("../utils/responseHandler");
const validateRequest = async (req, schema) => {
    try {
        const shape = schema.shape || {};
        let dataToValidate;
        if (shape.email && shape.password) {
            dataToValidate = req.body;
        }
        else if (shape.page || shape.limit) {
            dataToValidate = req.query;
        }
        else if (shape.id) {
            dataToValidate = req.params;
        }
        else {
            dataToValidate = req.body;
        }
        await schema.parseAsync(dataToValidate);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const details = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            throw {
                status: 400,
                code: 'VAL_001',
                message: 'Validation failed',
                details,
            };
        }
        throw error;
    }
};
exports.validateRequest = validateRequest;
const validationMiddleware = (schema) => {
    return async (req, res, next) => {
        try {
            await (0, exports.validateRequest)(req, schema);
            return next();
        }
        catch (error) {
            if (error.status === 400 && error.details) {
                return responseHandler_1.responseHandler.validation(res, error.details);
            }
            return next(error);
        }
    };
};
exports.validationMiddleware = validationMiddleware;
// Validation helper for query parameters with pagination
exports.paginateSchema = {
    page: (defaultPage = 1) => zod_1.z.coerce.number().int().min(1).default(defaultPage),
    limit: (defaultLimit = 20) => zod_1.z.coerce.number().int().min(1).max(100).default(defaultLimit),
    sortBy: (defaultSort = 'createdAt') => zod_1.z.string().default(defaultSort),
    sortOrder: () => zod_1.z.enum(['asc', 'desc']).default('desc'),
    search: () => zod_1.z.string().optional(),
    status: () => zod_1.z.enum(['active', 'inactive', 'deleted']).optional(),
};
//# sourceMappingURL=validation.middleware.js.map