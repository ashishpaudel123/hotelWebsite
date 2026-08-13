const express = require("express");
const router = express.Router();
const paymentService = require("./services/payment.service");
const authMiddleware = require("../../../middleware/auth.middleware");
const logger = require("../../../utils/logger");

/**
 * @route   POST /api/v1/payments/initiate
 * @desc    Initialize payment (eSewa/Khalti)
 * @access  Private
 */
router.post(
  "/initiate",
  authMiddleware.authenticate,
  async (req, res, next) => {
    try {
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

      const booking = await require("../../../models/Booking").findById(
        bookingId,
      );
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

      res.json({
        success: true,
        message: "Payment initiated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/v1/payments/webhook/esewa
 * @desc    eSewa payment webhook
 * @access  Public (secured by signature verification)
 */
router.post("/webhook/esewa", async (req, res, next) => {
  try {
    const data = req.body;

    logger.info("eSewa webhook received:", data);

    const result = await paymentService.verifyESewaPayment(
      data.transaction_uuid,
      data,
    );

    res.json({
      success: result.success,
      message: result.success
        ? "Payment verified successfully"
        : "Payment verification failed",
    });
  } catch (error) {
    logger.error("eSewa webhook error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "VERIFICATION_FAILED",
        message: error.message,
      },
    });
  }
});

/**
 * @route   POST /api/v1/payments/webhook/khalti
 * @desc    Khalti payment webhook
 * @access  Public (secured by signature verification)
 */
router.post("/webhook/khalti", async (req, res, next) => {
  try {
    const { pidx, transaction_id } = req.body;

    logger.info("Khalti webhook received:", req.body);

    const result = await paymentService.verifyKhaltiPayment(
      transaction_id,
      pidx,
    );

    res.json({
      success: result.success,
      message: result.success
        ? "Payment verified successfully"
        : "Payment verification failed",
    });
  } catch (error) {
    logger.error("Khalti webhook error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "VERIFICATION_FAILED",
        message: error.message,
      },
    });
  }
});

/**
 * @route   GET /api/v1/payments/:transactionId
 * @desc    Get payment details
 * @access  Private
 */
router.get(
  "/:transactionId",
  authMiddleware.authenticate,
  async (req, res, next) => {
    try {
      const payment = await paymentService.getPayment(req.params.transactionId);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments with filters
 * @access  Private (Admin/Finance)
 */
router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.checkPermission("payment:read"),
  async (req, res, next) => {
    try {
      const { page, limit, status, provider, bookingId } = req.query;

      const result = await paymentService.getPayments({
        page: page || 1,
        limit: limit || 10,
        status,
        provider,
        bookingId,
      });

      res.json({
        success: true,
        data: result.data,
        meta: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route   POST /api/v1/payments/:id/refund
 * @desc    Process refund
 * @access  Private (Admin/Finance)
 */
router.post(
  "/:id/refund",
  authMiddleware.authenticate,
  authMiddleware.checkPermission("payment:write"),
  async (req, res, next) => {
    try {
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

      res.json({
        success: true,
        message: "Refund processed successfully",
        data: refund,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
