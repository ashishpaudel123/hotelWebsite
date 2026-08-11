"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCoupon = exports.getCoupons = void 0;
const responseHandler_1 = require("../../../utils/responseHandler");
const models_1 = require("../../../models");
const getCoupons = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const coupons = await models_1.Coupon.find(filter).sort({ createdAt: -1 }).lean();
        return responseHandler_1.responseHandler.success(res, coupons, 'Coupons retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getCoupons = getCoupons;
const createCoupon = async (req, res, next) => {
    try {
        const coupon = await models_1.Coupon.create(req.body);
        return responseHandler_1.responseHandler.created(res, coupon, 'Coupon created successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.createCoupon = createCoupon;
//# sourceMappingURL=coupon.controller.js.map