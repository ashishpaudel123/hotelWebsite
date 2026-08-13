const crypto = require("crypto");
const axios = require("../../../utils/axios");
const Payment = require("../../../models/Payment");
const Booking = require("../../../models/Booking");
const logger = require("../../../utils/logger");
const paymentConfig = require("../../../config/payment.config");

class PaymentService {
  /**
   * Generate unique transaction ID
   */
  generateTransactionId() {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize eSewa payment
   */
  async initESewaPayment(bookingId, amount) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error("Booking not found");

      const transactionId = this.generateTransactionId();

      // eSewa parameters
      const params = {
        amt: amount.toString(),
        psc: "0",
        pdc: "0",
        txAmt: "0",
        tAmt: amount.toString(),
        pid: transactionId,
        scd: paymentConfig.esewa.merchantCode,
        su: paymentConfig.esewa.successUrl,
        fu: paymentConfig.esewa.failureUrl,
      };

      // Generate signature
      const signatureData = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

      const signature = crypto
        .createHash("md5")
        .update(signatureData + paymentConfig.esewa.secretKey)
        .digest("base64");

      params.signature = signature;

      // Save payment record
      await Payment.create({
        bookingId,
        transactionId,
        provider: "esewa",
        amount,
        currency: "NPR",
        status: "pending",
        metadata: {
          ipAddress: "", // Will be filled from request
          userAgent: "",
        },
      });

      logger.info(`eSewa payment initiated: ${transactionId}`);

      return {
        paymentUrl: paymentConfig.esewa.paymentUrl,
        params,
        transactionId,
      };
    } catch (error) {
      logger.error("Error initializing eSewa payment:", error);
      throw error;
    }
  }

  /**
   * Initialize Khalti payment
   */
  async initKhaltiPayment(bookingId, amount) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error("Booking not found");

      const transactionId = this.generateTransactionId();

      // Khalti payload
      const payload = {
        return_url: paymentConfig.khalti.successUrl,
        website_url: paymentConfig.khalti.websiteUrl,
        amount: amount * 100, // Khalti expects amount in paisa
        purchase_order_id: transactionId,
        purchase_order_name: `Booking ${booking.bookingReference}`,
        customer_info: {
          name: `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`,
          email: booking.guestDetails.email,
          phone: booking.guestDetails.phone,
        },
      };

      // Make request to Khalti API
      const response = await axios.post(
        paymentConfig.khalti.initiationUrl,
        payload,
        {
          headers: {
            Authorization: `Key ${paymentConfig.khalti.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Save payment record
      await Payment.create({
        bookingId,
        transactionId,
        provider: "khalti",
        amount,
        currency: "NPR",
        status: "pending",
        gatewayResponse: {
          pidx: response.data.pidx,
          checkoutUrl: response.data.checkout_url,
        },
        metadata: {
          ipAddress: "",
          userAgent: "",
        },
      });

      logger.info(`Khalti payment initiated: ${transactionId}`);

      return {
        checkoutUrl: response.data.checkout_url,
        pidx: response.data.pidx,
        transactionId,
      };
    } catch (error) {
      logger.error("Error initializing Khalti payment:", error);
      throw error;
    }
  }

  /**
   * Verify eSewa payment
   */
  async verifyESewaPayment(transactionId, data) {
    try {
      const payment = await Payment.findOne({
        transactionId,
        provider: "esewa",
      });
      if (!payment) throw new Error("Payment not found");

      // Verify signature
      const signatureData = `total_amount=${data.total_amount},transaction_uuid=${data.transaction_uuid},product_code=${data.product_code}`;
      const expectedSignature = crypto
        .createHash("sha256")
        .update(signatureData + paymentConfig.esewa.secretKey)
        .digest("base64");

      if (data.signature !== expectedSignature) {
        throw new Error("Invalid signature");
      }

      // Update payment status
      const status = data.status === "COMPLETE" ? "success" : "failed";

      await Payment.findOneAndUpdate(
        { transactionId },
        {
          status,
          gatewayResponse: {
            statusCode: data.status,
            message: data.status_message,
            transactionCode: data.transaction_code,
            rawResponse: data,
          },
          paymentMethod: "mobile_banking",
        },
      );

      // Update booking status
      if (status === "success") {
        await Booking.findByIdAndUpdate(payment.bookingId, {
          paymentStatus: "paid",
          status: "confirmed",
        });
      }

      logger.info(
        `eSewa payment verified: ${transactionId}, Status: ${status}`,
      );

      return { success: status === "success", payment };
    } catch (error) {
      logger.error("Error verifying eSewa payment:", error);
      throw error;
    }
  }

  /**
   * Verify Khalti payment
   */
  async verifyKhaltiPayment(transactionId, pidx) {
    try {
      const payment = await Payment.findOne({
        transactionId,
        provider: "khalti",
      });
      if (!payment) throw new Error("Payment not found");

      // Verify with Khalti API
      const response = await axios.post(
        paymentConfig.khalti.verificationUrl,
        { pidx },
        {
          headers: {
            Authorization: `Key ${paymentConfig.khalti.secretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const status =
        response.data.status === "Completed" ? "success" : "failed";

      await Payment.findOneAndUpdate(
        { transactionId },
        {
          status,
          gatewayResponse: {
            statusCode: response.data.status,
            message: response.data.message,
            transactionCode: response.data.transaction_id,
            rawResponse: response.data,
          },
          paymentMethod: "wallet",
        },
      );

      // Update booking status
      if (status === "success") {
        await Booking.findByIdAndUpdate(payment.bookingId, {
          paymentStatus: "paid",
          status: "confirmed",
        });
      }

      logger.info(
        `Khalti payment verified: ${transactionId}, Status: ${status}`,
      );

      return { success: status === "success", payment };
    } catch (error) {
      logger.error("Error verifying Khalti payment:", error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(bookingId, amount, reason, user) {
    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) throw new Error("Booking not found");

      const payment = await Payment.findOne({ bookingId, status: "success" });
      if (!payment)
        throw new Error("No successful payment found for this booking");

      const refundTransactionId = this.generateTransactionId();

      // Note: eSewa and Khalti have different refund processes
      // This is a simplified version - actual implementation depends on gateway APIs

      const refundRecord = await Payment.create({
        bookingId,
        transactionId: refundTransactionId,
        provider: payment.provider,
        amount,
        currency: "NPR",
        type: "refund",
        status: "pending",
        refundDetails: {
          reason,
          amount,
          refundedAt: new Date(),
        },
        processedBy: user._id,
      });

      // Update original payment
      await Payment.findByIdAndUpdate(payment._id, {
        status: "refunded",
        refundDetails: {
          reason,
          amount,
          refundTransactionId,
        },
      });

      // Update booking
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "refunded",
        status: "cancelled",
      });

      logger.info(
        `Refund processed: ${refundTransactionId} for booking ${bookingId}`,
      );

      return refundRecord;
    } catch (error) {
      logger.error("Error processing refund:", error);
      throw error;
    }
  }

  /**
   * Get payment by transaction ID
   */
  async getPayment(transactionId) {
    const payment = await Payment.findOne({ transactionId }).populate(
      "bookingId",
      "bookingReference guestDetails pricing",
    );

    if (!payment) throw new Error("Payment not found");

    return payment;
  }

  /**
   * Get payments with filters
   */
  async getPayments(filters) {
    const { page = 1, limit = 10, status, provider, bookingId } = filters;

    const query = {};
    if (status) query.status = status;
    if (provider) query.provider = provider;
    if (bookingId) query.bookingId = bookingId;

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate("bookingId", "bookingReference guestDetails")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments(query),
    ]);

    return {
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new PaymentService();
