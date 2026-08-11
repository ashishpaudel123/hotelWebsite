"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentByBookingId = exports.createPayment = void 0;
const responseHandler_1 = require("../../../utils/responseHandler");
const models_1 = require("../../../models");
const createPayment = async (req, res, next) => {
    try {
        const { bookingId, amount, paymentMethod, gateway = 'cash', transactionId, metadata } = req.body;
        const userId = req.user?.sub;
        const booking = await models_1.Booking.findById(bookingId).lean();
        if (!booking) {
            return responseHandler_1.responseHandler.notFound(res, 'Booking');
        }
        const isAdmin = req.user?.permissions?.includes('payment:manage') || req.user?.permissions?.includes('*:*') || req.user?.role === 'admin' || req.user?.role === 'staff';
        if (!isAdmin && booking.customerId && booking.customerId.toString() !== userId) {
            return responseHandler_1.responseHandler.forbidden(res, 'You can only make payments for your own bookings');
        }
        if (booking.status === 'cancelled') {
            return responseHandler_1.responseHandler.error(res, 'Cannot process payment for a cancelled booking', 400, 'PAY_001');
        }
        if (booking.status === 'checked_out') {
            return responseHandler_1.responseHandler.error(res, 'Cannot process payment for a completed booking', 400, 'PAY_002');
        }
        const existingPayment = await models_1.Payment.findOne({ bookingId }).lean();
        if (existingPayment && existingPayment.status === 'completed') {
            return responseHandler_1.responseHandler.error(res, 'Payment already completed for this booking', 400, 'PAY_003');
        }
        const payment = await models_1.Payment.create({
            bookingId,
            transactionId: transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            gateway,
            amount: amount || booking.pricing.total,
            currency: booking.pricing.currency || 'USD',
            status: 'completed',
            paymentMethod: paymentMethod || gateway,
            metadata: metadata || {},
        });
        await models_1.Booking.findByIdAndUpdate(bookingId, {
            paymentStatus: amount >= booking.pricing.total ? 'paid' : 'partial',
        });
        return responseHandler_1.responseHandler.created(res, payment, 'Payment processed successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.createPayment = createPayment;
const getPaymentByBookingId = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const payment = await models_1.Payment.findOne({ bookingId }).lean();
        if (!payment) {
            return responseHandler_1.responseHandler.notFound(res, 'Payment');
        }
        return responseHandler_1.responseHandler.success(res, payment, 'Payment retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getPaymentByBookingId = getPaymentByBookingId;
//# sourceMappingURL=payment.controller.js.map