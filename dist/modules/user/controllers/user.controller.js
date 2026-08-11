"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const responseHandler_1 = require("../../../utils/responseHandler");
const regex_1 = require("../../../utils/regex");
const models_1 = require("../../../models");
const getUsers = async (req, res, next) => {
    try {
        const { page, limit, role, status, search } = req.query;
        const filter = { isDeleted: false };
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        if (search) {
            const sanitizedSearch = (0, regex_1.sanitizeRegex)(search);
            filter.$or = [
                { firstName: { $regex: sanitizedSearch, $options: 'i' } },
                { lastName: { $regex: sanitizedSearch, $options: 'i' } },
                { email: { $regex: sanitizedSearch, $options: 'i' } },
            ];
        }
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;
        const skip = (pageNum - 1) * limitNum;
        const [users, total] = await Promise.all([
            models_1.User.find(filter)
                .populate('role', 'name slug')
                .select('-password -passwordResetToken -passwordResetExpires')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models_1.User.countDocuments(filter),
        ]);
        return responseHandler_1.responseHandler.success(res, users, 'Users retrieved successfully', 200, {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await models_1.User.findById(id)
            .populate('role', 'name slug permissions')
            .select('-password -passwordResetToken -passwordResetExpires')
            .lean();
        if (!user) {
            return responseHandler_1.responseHandler.notFound(res, 'User');
        }
        return responseHandler_1.responseHandler.success(res, user, 'User retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res, next) => {
    try {
        const user = await models_1.User.create(req.body);
        const populated = await models_1.User.findById(user._id)
            .populate('role', 'name slug')
            .select('-password -passwordResetToken -passwordResetExpires')
            .lean();
        return responseHandler_1.responseHandler.created(res, populated, 'User created successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatePayload = { ...req.body };
        if (updatePayload.password) {
            const hashedPassword = await bcrypt.hash(updatePayload.password, 12);
            updatePayload.password = hashedPassword;
            updatePayload.passwordChangedAt = new Date();
        }
        else {
            delete updatePayload.password;
        }
        const user = await models_1.User.findByIdAndUpdate(id, updatePayload, { new: true })
            .populate('role', 'name slug')
            .select('-password -passwordResetToken -passwordResetExpires')
            .lean();
        if (!user) {
            return responseHandler_1.responseHandler.notFound(res, 'User');
        }
        return responseHandler_1.responseHandler.success(res, user, 'User updated successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await models_1.User.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() });
        return responseHandler_1.responseHandler.success(res, null, 'User deleted successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map