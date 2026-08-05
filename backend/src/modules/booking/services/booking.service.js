const bookingRepository = require('./repositories/booking.repository');
const paymentService = require('../payment/services/payment.service');
const notificationService = require('../notification/services/email.service');
const smsService = require('../notification/services/sms.service');
const Coupon = require('../../models/Coupon');
const RoomType = require('../../models/RoomType');
const logger = require('../../utils/logger');
const { CreateBookingDTO, CancelBookingDTO, UpdateBookingStatusDTO } = require('./dtos/booking.dto');

class BookingService {
  /**
   * Create a new booking with availability check and pricing
   */
  async createBooking(bookingData, user) {
    try {
      // Validate input
      const dto = new CreateBookingDTO(bookingData);
      dto.validate();

      // Start session for atomic transaction
      const session = await bookingRepository.constructor.startSession();
      session.startTransaction();

      try {
        // Check availability for each room
        for (const room of bookingData.rooms) {
          const availability = await bookingRepository.checkAvailability(
            room.roomTypeId,
            bookingData.checkIn,
            bookingData.checkOut,
            room.quantity
          );

          if (!availability.available) {
            throw new Error(`Room type ${room.roomTypeId}: ${availability.message}`);
          }
        }

        // Calculate pricing
        const pricing = await this.calculatePricing(bookingData);

        // Apply coupon if provided
        if (bookingData.couponCode) {
          const coupon = await this.validateAndApplyCoupon(bookingData.couponCode, pricing.subtotal, bookingData.rooms);
          pricing.discount = coupon.discountAmount;
          pricing.couponCode = coupon.code;
          pricing.total = pricing.subtotal + pricing.tax - coupon.discountAmount;
        }

        // Create booking
        const booking = await bookingRepository.create({
          customerId: bookingData.customerId || user._id,
          guestDetails: bookingData.guestDetails,
          checkIn: new Date(bookingData.checkIn),
          checkOut: new Date(bookingData.checkOut),
          rooms: bookingData.rooms.map(room => ({
            ...room,
            totalNights: this.calculateNights(bookingData.checkIn, bookingData.checkOut)
          })),
          pricing,
          source: bookingData.source,
          metadata: bookingData.metadata
        });

        await session.commitTransaction();

        // Send confirmation email and SMS
        await this.sendBookingConfirmation(booking);

        logger.info(`Booking created: ${booking.bookingReference}`);
        return booking;

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      logger.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Calculate pricing for booking
   */
  async calculatePricing(bookingData) {
    let subtotal = 0;
    const nights = this.calculateNights(bookingData.checkIn, bookingData.checkOut);

    for (const room of bookingData.rooms) {
      const roomType = await RoomType.findById(room.roomTypeId);
      const pricePerNight = room.pricePerNight || roomType.basePrice;
      subtotal += pricePerNight * room.quantity * nights;
    }

    const taxRate = 0.13; // 13% VAT
    const tax = subtotal * taxRate;

    return {
      subtotal,
      tax,
      discount: 0,
      total: subtotal + tax,
      currency: 'NPR'
    };
  }

  /**
   * Calculate number of nights
   */
  calculateNights(checkIn, checkOut) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((new Date(checkOut) - new Date(checkIn)) / oneDay));
  }

  /**
   * Validate and apply coupon
   */
  async validateAndApplyCoupon(code, subtotal, rooms) {
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      status: 'active'
    });

    if (!coupon) {
      throw new Error('Invalid coupon code');
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      throw new Error('Coupon is not valid for the selected dates');
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }

    // Check minimum booking amount
    if (subtotal < coupon.minBookingAmount) {
      throw new Error(`Minimum booking amount of NPR ${coupon.minBookingAmount} required`);
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Increment usage count
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });

    return {
      code: coupon.code,
      discountAmount,
      description: coupon.description
    };
  }

  /**
   * Check room availability
   */
  async checkAvailability(checkIn, checkOut, roomTypeId, quantity) {
    return await bookingRepository.checkAvailability(roomTypeId, checkIn, checkOut, quantity);
  }

  /**
   * Get booking by ID
   */
  async getBooking(id) {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  /**
   * Get booking by reference
   */
  async getBookingByReference(reference) {
    const booking = await bookingRepository.findByReference(reference);
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  /**
   * List bookings with filters
   */
  async listBookings(filters, options) {
    return await bookingRepository.findWithFilters(filters, options);
  }

  /**
   * Update booking status
   */
  async updateStatus(bookingId, status, reason, user) {
    const dto = new UpdateBookingStatusDTO({ bookingId, status, reason, updatedBy: user._id });
    dto.validate();

    const booking = await bookingRepository.updateStatus(bookingId, status, reason, user._id);
    
    // Send notification on status change
    if (status === 'confirmed') {
      await this.sendBookingConfirmation(booking);
    } else if (status === 'cancelled') {
      await this.sendBookingCancellation(booking, reason);
    }

    return booking;
  }

  /**
   * Cancel booking with refund
   */
  async cancelBooking(bookingId, reason, user) {
    const booking = await this.getBooking(bookingId);
    
    // Calculate refund based on cancellation policy
    const refundAmount = this.calculateRefund(booking);
    
    const cancelledBooking = await bookingRepository.cancel(bookingId, reason, refundAmount);
    
    // Process refund if payment was made
    if (booking.paymentStatus === 'paid' && refundAmount > 0) {
      await paymentService.processRefund(bookingId, refundAmount, reason, user);
    }

    // Send cancellation notification
    await this.sendBookingCancellation(cancelledBooking, reason);

    return cancelledBooking;
  }

  /**
   * Calculate refund amount based on days before check-in
   */
  calculateRefund(booking) {
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const daysBeforeCheckIn = (checkIn - now) / (1000 * 60 * 60 * 24);

    let refundPercentage = 0;
    
    if (daysBeforeCheckIn > 7) {
      refundPercentage = 100; // Full refund
    } else if (daysBeforeCheckIn > 3) {
      refundPercentage = 50; // 50% refund
    } else if (daysBeforeCheckIn > 1) {
      refundPercentage = 25; // 25% refund
    } else {
      refundPercentage = 0; // No refund
    }

    return (booking.pricing.total * refundPercentage) / 100;
  }

  /**
   * Send booking confirmation email and SMS
   */
  async sendBookingConfirmation(booking) {
    try {
      // Email
      await notificationService.sendBookingConfirmation({
        to: booking.guestDetails.email,
        booking: booking
      });

      // SMS
      await smsService.sendSMS({
        to: booking.guestDetails.phone,
        message: `Booking Confirmed! Ref: ${booking.bookingReference}. Check-in: ${new Date(booking.checkIn).toLocaleDateString()}. Total: NPR ${booking.pricing.total}`
      });

      logger.info(`Confirmation sent for booking: ${booking.bookingReference}`);
    } catch (error) {
      logger.error('Error sending booking confirmation:', error);
      // Don't throw - booking is still valid even if notification fails
    }
  }

  /**
   * Send booking cancellation notification
   */
  async sendBookingCancellation(booking, reason) {
    try {
      await notificationService.sendBookingCancellation({
        to: booking.guestDetails.email,
        booking: booking,
        reason: reason
      });

      logger.info(`Cancellation notification sent for booking: ${booking.bookingReference}`);
    } catch (error) {
      logger.error('Error sending cancellation notification:', error);
    }
  }

  /**
   * Get booking statistics
   */
  async getStatistics(startDate, endDate) {
    return await bookingRepository.getStatistics(startDate, endDate);
  }
}

module.exports = new BookingService();
