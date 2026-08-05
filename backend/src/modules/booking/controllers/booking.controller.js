const express = require('express');
const router = express.Router();
const bookingService = require('./services/booking.service');
const authMiddleware = require('../../middleware/auth.middleware');
const validationMiddleware = require('../../middleware/validation.middleware');
const { 
  createBookingSchema, 
  availabilityCheckSchema, 
  cancelBookingSchema, 
  updateBookingStatusSchema,
  bookingQuerySchema 
} = require('./validators/booking.validator');

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking
 * @access  Private (Guest/Admin)
 */
router.post('/', 
  authMiddleware.authenticate,
  validationMiddleware.validate(createBookingSchema),
  async (req, res, next) => {
    try {
      const booking = await bookingService.createBooking(req.body, req.user);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all bookings with filters
 * @access  Private (Admin/Staff)
 */
router.get('/', 
  authMiddleware.authenticate,
  authMiddleware.checkPermission('booking:read'),
  async (req, res, next) => {
    try {
      const { error, value } = bookingQuerySchema.safeParse(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.errors
          }
        });
      }

      const result = await bookingService.listBookings(value, {
        sortBy: value.sortBy,
        sortOrder: value.sortOrder
      });

      res.json({
        success: true,
        data: result.data,
        meta: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', 
  authMiddleware.authenticate,
  async (req, res, next) => {
    try {
      const booking = await bookingService.getBooking(req.params.id);
      
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/bookings/reference/:ref
 * @desc    Get booking by reference number
 * @access  Public (for guests to check their booking)
 */
router.get('/reference/:ref', 
  async (req, res, next) => {
    try {
      const booking = await bookingService.getBookingByReference(req.params.ref);
      
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/bookings/check-availability
 * @desc    Check room availability for dates
 * @access  Public
 */
router.post('/check-availability', 
  validationMiddleware.validate(availabilityCheckSchema),
  async (req, res, next) => {
    try {
      const { checkIn, checkOut, roomTypeId, quantity } = req.body;
      
      const availability = await bookingService.checkAvailability(
        checkIn, 
        checkOut, 
        roomTypeId, 
        quantity
      );

      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/v1/bookings/:id/status
 * @desc    Update booking status
 * @access  Private (Admin/Staff)
 */
router.patch('/:id/status', 
  authMiddleware.authenticate,
  authMiddleware.checkPermission('booking:write'),
  validationMiddleware.validate(updateBookingStatusSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      const booking = await bookingService.updateStatus(id, status, reason, req.user);
      
      res.json({
        success: true,
        message: `Booking status updated to ${status}`,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/v1/bookings/:id/cancel
 * @desc    Cancel booking with refund
 * @access  Private (Guest/Admin)
 */
router.post('/:id/cancel', 
  authMiddleware.authenticate,
  validationMiddleware.validate(cancelBookingSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      // Check if user owns the booking or is admin
      const booking = await bookingService.getBooking(id);
      if (booking.customerId._id.toString() !== req.user._id.toString() && 
          !req.user.roles.some(r => r.name === 'admin')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'You can only cancel your own bookings'
          }
        });
      }

      const cancelledBooking = await bookingService.cancelBooking(id, reason, req.user);
      
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: cancelledBooking
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/v1/bookings/statistics
 * @desc    Get booking statistics
 * @access  Private (Admin)
 */
router.get('/statistics', 
  authMiddleware.authenticate,
  authMiddleware.checkPermission('booking:read'),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Start date and end date are required'
          }
        });
      }

      const stats = await bookingService.getStatistics(startDate, endDate);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
