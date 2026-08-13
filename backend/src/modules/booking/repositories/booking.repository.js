const Booking = require("../../../models/Booking");
const RoomType = require("../../../models/RoomType");
const logger = require("../../../utils/logger");

class BookingRepository {
  /**
   * Create a new booking
   */
  async create(bookingData) {
    try {
      const booking = await Booking.create(bookingData);
      return await this.findById(booking._id);
    } catch (error) {
      logger.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Find booking by ID with population
   */
  async findById(id) {
    try {
      const booking = await Booking.findById(id)
        .populate("customerId", "firstName lastName email phone")
        .populate("rooms.roomTypeId", "name basePrice amenities")
        .populate("assignedStaff", "firstName lastName email");

      if (!booking || booking.isDeleted) {
        return null;
      }

      return booking;
    } catch (error) {
      logger.error("Error finding booking by ID:", error);
      throw error;
    }
  }

  /**
   * Find booking by reference
   */
  async findByReference(reference) {
    try {
      const booking = await Booking.findOne({ bookingReference: reference })
        .populate("customerId", "firstName lastName email phone")
        .populate("rooms.roomTypeId", "name basePrice amenities");

      return booking;
    } catch (error) {
      logger.error("Error finding booking by reference:", error);
      throw error;
    }
  }

  /**
   * Check room availability for given dates
   */
  async checkAvailability(roomTypeId, checkIn, checkOut, quantity) {
    try {
      // Find conflicting bookings
      const conflictingBookings = await Booking.find({
        "rooms.roomTypeId": roomTypeId,
        status: { $in: ["pending", "confirmed", "checked_in"] },
        $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
      }).populate("rooms.roomTypeId");

      // Calculate available rooms
      const roomType = await RoomType.findById(roomTypeId);
      if (!roomType)
        return { available: false, message: "Room type not found" };

      // Count booked rooms in the conflicting period
      let bookedRooms = 0;
      conflictingBookings.forEach((booking) => {
        const roomEntry = booking.rooms.find(
          (r) => r.roomTypeId._id.toString() === roomTypeId,
        );
        if (roomEntry) {
          bookedRooms += roomEntry.quantity;
        }
      });

      const availableRooms = roomType.totalRooms - bookedRooms;

      return {
        available: availableRooms >= quantity,
        availableCount: availableRooms,
        requestedQuantity: quantity,
        message:
          availableRooms >= quantity
            ? "Rooms available"
            : "Insufficient rooms available",
      };
    } catch (error) {
      logger.error("Error checking availability:", error);
      throw error;
    }
  }

  /**
   * Find bookings with filters and pagination
   */
  async findWithFilters(filters, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        checkInStart,
        checkInEnd,
        customerId,
        search,
      } = filters;

      const query = {};

      if (status) query.status = status;
      if (paymentStatus) query.paymentStatus = paymentStatus;
      if (customerId) query.customerId = customerId;

      // Date range filter
      if (checkInStart || checkInEnd) {
        query.checkIn = {};
        if (checkInStart) query.checkIn.$gte = new Date(checkInStart);
        if (checkInEnd) query.checkIn.$lte = new Date(checkInEnd);
      }

      // Search filter
      if (search) {
        query.$or = [
          { bookingReference: { $regex: search, $options: "i" } },
          { "guestDetails.email": { $regex: search, $options: "i" } },
          { "guestDetails.phone": { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;
      const sortBy = options.sortBy || "createdAt";
      const sortOrder = options.sortOrder === "asc" ? 1 : -1;

      const [bookings, total] = await Promise.all([
        Booking.find(query)
          .populate("customerId", "firstName lastName email phone")
          .populate("rooms.roomTypeId", "name basePrice")
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(parseInt(limit)),
        Booking.countDocuments(query),
      ]);

      return {
        data: bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error finding bookings with filters:", error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateStatus(id, status, reason, updatedBy) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        id,
        {
          status,
          $push: {
            statusHistory: {
              previousStatus: booking?.status,
              newStatus: status,
              changedBy: updatedBy,
              reason,
              timestamp: new Date(),
            },
          },
        },
        { new: true },
      );

      return booking;
    } catch (error) {
      logger.error("Error updating booking status:", error);
      throw error;
    }
  }

  /**
   * Cancel booking with refund calculation
   */
  async cancel(id, reason, refundAmount) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        id,
        {
          status: "cancelled",
          cancellationPolicy: {
            applicable: true,
            refundAmount,
            deadline: new Date(),
          },
        },
        { new: true },
      );

      return booking;
    } catch (error) {
      logger.error("Error cancelling booking:", error);
      throw error;
    }
  }

  /**
   * Update booking payment status
   */
  async updatePaymentStatus(id, paymentStatus) {
    try {
      const booking = await Booking.findByIdAndUpdate(
        id,
        { paymentStatus },
        { new: true },
      );

      return booking;
    } catch (error) {
      logger.error("Error updating payment status:", error);
      throw error;
    }
  }

  /**
   * Get booking statistics
   */
  async getStatistics(startDate, endDate) {
    try {
      const matchStage = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const stats = await Booking.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$paymentStatus", "paid"] },
                  "$pricing.total",
                  0,
                ],
              },
            },
          },
        },
      ]);

      return stats;
    } catch (error) {
      logger.error("Error getting booking statistics:", error);
      throw error;
    }
  }
}

module.exports = new BookingRepository();
