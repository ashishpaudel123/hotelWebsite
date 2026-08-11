"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', (0, auth_middleware_1.checkRole)('admin', 'staff'), coupon_controller_1.getCoupons);
router.post('/', (0, auth_middleware_1.checkRole)('admin'), coupon_controller_1.createCoupon);
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map