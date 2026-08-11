"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errors_1 = require("../utils/errors");
const errorMiddleware = (err, req, res, next) => {
    // Delegate to the main error handler
    return (0, errors_1.errorHandler)(err, req, res, next);
};
exports.errorMiddleware = errorMiddleware;
//# sourceMappingURL=error.middleware.js.map