const paymentService = require("../services/payment.service");
const authMiddleware = require("../../../middleware/auth.middleware");
const logger = require("../../../utils/logger");

// Helper to handle route operations dynamically
const routeHandlers = {
  post: (path) => async (req, res, next) => {
    try {
      if (path === '/initiate') {
        const { bookingId, provider } = req.body;

        if (!bookingId || !provider) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Booking ID and provider are required",
            },
          });
        }

        const Booking = require("../../../models/Booking");
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          return res.status(404).json({
            success: false,
            error: {
              code: "NOT_FOUND",
              message: "Booking not found",
            },
          });
        }

        let result;
        if (provider === "esewa") {
          result = await paymentService.initESewaPayment(
            bookingId,
            booking.pricing.total,
          );
        } else if (provider === "khalti") {
          result = await paymentService.initKhaltiPayment(
            bookingId,
            booking.pricing.total,
          );
        } else {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_PROVIDER",
              message: "Supported providers: esewa, khalti",
            },
          });
        }

        return res.json({
          success: true,
          message: "Payment initiated successfully",
          data: result,
        });
      } else if (path.startsWith('/webhook/esewa')) {
        const data = req.body;
        logger.info("eSewa webhook received:", data);

        const result = await paymentService.verifyESewaPayment(
          data.transaction_uuid,
          data,
        );

        return res.json({
          success: result.success,
          message: result.success
            ? "Payment verified successfully"
            : "Payment verification failed",
        });
      } else if (path.startsWith('/webhook/khalti')) {
        const { pidx, transaction_id } = req.body;
        logger.info("Khalti webhook received:", req.body);

        const result = await paymentService.verifyKhaltiPayment(
          transaction_id,
          pidx,
        );

        return res.json({
          success: result.success,
          message: result.success
            ? "Payment verified successfully"
            : "Payment verification failed",
        });
      } else if (path.endsWith('/refund')) {
        const { amount, reason } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Valid refund amount is required",
            },
          });
        }

        const refund = await paymentService.processRefund(
          req.params.id,
          amount,
          reason || "Refund requested by admin",
          req.user,
        );

        return res.json({
          success: true,
          message: "Refund processed successfully",
          data: refund,
        });
      }
    } catch (error) {
      next(error);
    }
  },
  get: (path) => async (req, res, next) => {
    try {
      if (path === '/') {
        const { page, limit, status, provider, bookingId } = req.query;

        const result = await paymentService.getPayments({
          page: page || 1,
          limit: limit || 10,
          status,
          provider,
          bookingId,
        });

        return res.json({
          success: true,
          data: result.data,
          meta: {
            page: result.pagination.page,
            limit: result.pagination.limit,
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
          },
        });
      } else if (path === '/:transactionId') {
        const payment = await paymentService.getPayment(req.params.transactionId);
        return res.json({
          success: true,
          data: payment,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = {
  post: routeHandlers.post,
  get: routeHandlers.get,
};
