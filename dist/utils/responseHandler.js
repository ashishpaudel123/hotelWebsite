"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
exports.responseHandler = {
    success(res, data, message = 'Success', statusCode = 200, meta) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            ...(meta && { meta }),
            timestamp: new Date().toISOString(),
        });
    },
    created(res, data, message = 'Resource created successfully', meta) {
        return this.success(res, data, message, 201, meta);
    },
    error(res, message, statusCode = 400, code = 'ERR_001', details) {
        return res.status(statusCode).json({
            success: false,
            error: {
                code,
                message,
                ...(details && { details }),
            },
            timestamp: new Date().toISOString(),
        });
    },
    notFound(res, resource = 'Resource') {
        return this.error(res, `${resource} not found`, 404, 'RES_001');
    },
    unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401, 'AUTH_001');
    },
    forbidden(res, message = 'Forbidden') {
        return this.error(res, message, 403, 'PERM_001');
    },
    validation(res, details) {
        return this.error(res, 'Validation failed', 400, 'VAL_001', details);
    },
    conflict(res, message = 'Resource already exists') {
        return this.error(res, message, 409, 'RES_002');
    },
    serverError(res, message = 'Internal server error') {
        return this.error(res, message, 500, 'SYS_001');
    },
};
//# sourceMappingURL=responseHandler.js.map