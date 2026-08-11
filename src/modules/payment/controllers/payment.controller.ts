import { Request, Response, NextFunction } from 'express';
import { responseHandler } from '../../../utils/responseHandler';
import { Payment, Booking } from '../../../models';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, amount, paymentMethod, gateway = 'cash', transactionId, metadata } = req.body as any;
    const userId = req.user?.sub;

    const booking = await Booking.findById(bookingId).lean();
    if (!booking) {
      return responseHandler.notFound(res, 'Booking');
    }

    const isAdmin = req.user?.permissions?.includes('payment:manage') || req.user?.permissions?.includes('*:*') || req.user?.role === 'admin' || req.user?.role === 'staff';
    if (!isAdmin && booking.customerId && booking.customerId.toString() !== userId) {
      return responseHandler.forbidden(res, 'You can only make payments for your own bookings');
    }

    if (booking.status === 'cancelled') {
      return responseHandler.error(res, 'Cannot process payment for a cancelled booking', 400, 'PAY_001');
    }

    if (booking.status === 'checked_out') {
      return responseHandler.error(res, 'Cannot process payment for a completed booking', 400, 'PAY_002');
    }

    const existingPayment = await Payment.findOne({ bookingId }).lean();
    if (existingPayment && existingPayment.status === 'completed') {
      return responseHandler.error(res, 'Payment already completed for this booking', 400, 'PAY_003');
    }

    const payment = await Payment.create({
      bookingId,
      transactionId: transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      gateway,
      amount: amount || booking.pricing.total,
      currency: booking.pricing.currency || 'USD',
      status: 'completed',
      paymentMethod: paymentMethod || gateway,
      metadata: metadata || {},
    });

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: amount >= booking.pricing.total ? 'paid' : 'partial',
    });

    return responseHandler.created(res, payment, 'Payment processed successfully');
  } catch (error) {
    return next(error);
  }
};

export const getPaymentByBookingId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId }).lean();

    if (!payment) {
      return responseHandler.notFound(res, 'Payment');
    }

    return responseHandler.success(res, payment, 'Payment retrieved successfully');
  } catch (error) {
    return next(error);
  }
};
