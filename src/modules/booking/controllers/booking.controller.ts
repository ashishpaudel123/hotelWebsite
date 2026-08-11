import { Request, Response, NextFunction } from 'express';
import { responseHandler } from '../../../utils/responseHandler';
import { sanitizeRegex } from '../../../utils/regex';
import { Booking, Room, RoomType, Coupon } from '../../../models';

const TAX_RATE = 0.13;

function calculateNights(checkIn: Date, checkOut: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const nights = Math.round(Math.abs((checkOut.getTime() - checkIn.getTime()) / oneDay));
  return Math.max(nights, 1);
}

async function checkBookingOverlap(roomId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string): Promise<boolean> {
  const conflictQuery: any = {
    rooms: { $elemMatch: { roomId: new (await import('mongoose')).default.Types.ObjectId(roomId) } },
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
    ],
  };

  if (excludeBookingId) {
    conflictQuery._id = { $ne: new (await import('mongoose')).default.Types.ObjectId(excludeBookingId) };
  }

  const conflictingBooking = await Booking.findOne(conflictQuery).lean();
  return !!conflictingBooking;
}

async function calculateServerPricing(rooms: Array<{ roomId: string; quantity: number; price?: number }>, checkIn: Date, checkOut: Date): Promise<{ subtotal: number; tax: number; total: number; currency: string }> {
  const nights = calculateNights(checkIn, checkOut);
  let subtotal = 0;

  for (const room of rooms) {
    const roomDoc = await Room.findById(room.roomId).lean();
    if (!roomDoc) {
      throw new Error(`Room not found for room ${room.roomId}`);
    }
    const roomType = await RoomType.findById((roomDoc as any).roomType).lean();
    if (!roomType) {
      throw new Error(`Room type not found for room ${room.roomId}`);
    }
    const pricePerNight = room.price ?? roomType.basePrice;
    subtotal += pricePerNight * room.quantity * nights;
  }

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    currency: 'USD',
  };
}

export const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status, paymentStatus, customerId, search, sortBy, sortOrder } = req.query as any;
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customerId = customerId;
    if (search) {
      const sanitizedSearch = sanitizeRegex(search);
      filter.$or = [
        { bookingReference: { $regex: sanitizedSearch, $options: 'i' } },
        { 'guestDetails.email': { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('customerId', 'firstName lastName email')
        .sort({ [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);

    return responseHandler.success(res, bookings, 'Bookings retrieved successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    return next(error);
  }
};

export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('customerId', 'firstName lastName email phone')
      .lean();

    if (!booking) {
      return responseHandler.notFound(res, 'Booking');
    }

    const isAdmin = req.user?.permissions?.includes('booking:manage') || req.user?.permissions?.includes('*:*') || req.user?.role === 'admin' || req.user?.role === 'staff';
    if (!isAdmin && booking.customerId && (booking.customerId as any)._id?.toString() !== req.user?.sub) {
      return responseHandler.forbidden(res, 'You can only view your own bookings');
    }

    return responseHandler.success(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body as any;

    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (isNaN(checkIn.getTime())) {
      return responseHandler.validation(res, [{ field: 'checkIn', message: 'Invalid check-in date' }]);
    }
    if (isNaN(checkOut.getTime())) {
      return responseHandler.validation(res, [{ field: 'checkOut', message: 'Invalid check-out date' }]);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return responseHandler.validation(res, [{ field: 'checkIn', message: 'Check-in date cannot be in the past' }]);
    }

    if (checkOut <= checkIn) {
      return responseHandler.validation(res, [{ field: 'checkOut', message: 'Check-out date must be after check-in date' }]);
    }

    const rooms = body.rooms as Array<{ roomId: string; roomType: string; quantity: number; price?: number; adults: number; children: number }>;
    if (!rooms || rooms.length === 0) {
      return responseHandler.validation(res, [{ field: 'rooms', message: 'At least one room is required' }]);
    }

    for (const room of rooms) {
      const roomDoc = await Room.findById(room.roomId).lean();
      if (!roomDoc) {
        return responseHandler.validation(res, [{ field: 'rooms', message: `Room ${room.roomId} not found` }]);
      }

      const isOverlapping = await checkBookingOverlap(room.roomId, checkIn, checkOut);
      if (isOverlapping) {
        return responseHandler.conflict(res, `Room ${roomDoc.roomNumber} is already booked for the selected dates`);
      }

      const roomType = await RoomType.findById((roomDoc as any).roomType).lean();
      if (!roomType) {
        return responseHandler.validation(res, [{ field: 'rooms', message: `Room type not found for room ${room.roomId}` }]);
      }

      const totalGuests = (room.adults || 0) + (room.children || 0);
      if (totalGuests <= 0) {
        return responseHandler.validation(res, [{ field: 'rooms', message: `At least one guest is required for room ${roomDoc.roomNumber}` }]);
      }

      if (totalGuests > roomType.maxOccupancy) {
        return responseHandler.validation(res, [
          {
            field: 'rooms',
            message: `Room ${roomDoc.roomNumber} supports maximum ${roomType.maxOccupancy} guests, but ${totalGuests} were specified`,
          },
        ]);
      }
    }

    const serverPricing = await calculateServerPricing(rooms, checkIn, checkOut);

    if (body.pricing && body.pricing.total !== undefined) {
      const clientTotal = parseFloat(body.pricing.total);
      if (Math.abs(clientTotal - serverPricing.total) > 0.01) {
        return responseHandler.validation(res, [
          {
            field: 'pricing.total',
            message: `Client pricing (${clientTotal}) does not match server calculation (${serverPricing.total.toFixed(2)})`,
          },
        ]);
      }
    }

    let discount = 0;
    if (body.couponCode) {
      const couponResult = await validateAndApplyCoupon(body.couponCode, serverPricing.subtotal, req.user?.sub);
      if (!couponResult.valid) {
        return responseHandler.validation(res, [{ field: 'couponCode', message: couponResult.message }]);
      }
      discount = couponResult.discountAmount || 0;
    }

    const nights = calculateNights(checkIn, checkOut);
    const total = serverPricing.subtotal + serverPricing.tax - discount;
    const bookingData: any = {
      ...body,
      checkIn,
      checkOut,
      bookingReference: `HTL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      rooms: rooms.map((room) => ({
        roomId: room.roomId,
        roomType: room.roomType,
        quantity: room.quantity,
        price: room.price ?? serverPricing.subtotal / (rooms.reduce((sum, r) => sum + r.quantity, 0) * nights),
        adults: room.adults,
        children: room.children,
      })),
      pricing: {
        subtotal: serverPricing.subtotal,
        tax: serverPricing.tax,
        discount,
        total: Math.max(total, 0),
        currency: serverPricing.currency,
      },
    };

    const booking = await Booking.create(bookingData);
    const populated = await Booking.findById(booking._id)
      .populate('customerId', 'firstName lastName email')
      .lean();

    return responseHandler.created(res, populated, 'Booking created successfully');
  } catch (error) {
    return next(error);
  }
};

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId, checkIn, checkOut, quantity = 1 } = req.body as any;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return responseHandler.validation(res, [{ field: 'dates', message: 'Invalid date format' }]);
    }

    if (checkOutDate <= checkInDate) {
      return responseHandler.validation(res, [{ field: 'checkOut', message: 'Check-out must be after check-in' }]);
    }

    const room = await Room.findById(roomId).lean();
    if (!room) {
      return responseHandler.notFound(res, 'Room');
    }

    const isOverlapping = await checkBookingOverlap(roomId, checkInDate, checkOutDate);
    if (isOverlapping) {
      return responseHandler.success(res, {
        available: false,
        message: 'Room is not available for the selected dates',
        quantity,
      });
    }

    return responseHandler.success(res, {
      available: true,
      message: 'Room is available for the selected dates',
      quantity,
    });
  } catch (error) {
    return next(error);
  }
};

async function updateRoomStatusForBooking(bookingId: string, status: string): Promise<void> {
  const booking = await Booking.findById(bookingId).lean();
  if (!booking) return;

  const roomIds = booking.rooms.map((r: any) => r.roomId);

  if (status === 'checked_in') {
    await Room.updateMany(
      { _id: { $in: roomIds } },
      { status: 'occupied', currentBooking: booking._id }
    );
  } else if (status === 'checked_out' || status === 'cancelled') {
    await Room.updateMany(
      { _id: { $in: roomIds }, currentBooking: booking._id },
      { status: 'available', currentBooking: undefined }
    );
  }
}

export const getBookingByReference = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ref } = req.params;
    const booking = await Booking.findOne({ bookingReference: ref.toUpperCase() })
      .populate('customerId', 'firstName lastName email phone')
      .lean();

    if (!booking) {
      return responseHandler.notFound(res, 'Booking');
    }

    return responseHandler.success(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

async function validateAndApplyCoupon(
  code: string,
  subtotal: number,
  customerId?: string
): Promise<{ valid: boolean; message: string; discountAmount?: number }> {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });

  if (!coupon) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  if (coupon.validTo && now > coupon.validTo) {
    return { valid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  if (coupon.perUserLimit && customerId) {
    const userUsageCount = await Booking.countDocuments({
      customerId: new (await import('mongoose')).default.Types.ObjectId(customerId),
      'pricing.discount': { $gt: 0 },
      createdAt: { $gte: coupon.validFrom, $lte: coupon.validTo || now },
    });
    if (userUsageCount >= coupon.perUserLimit) {
      return { valid: false, message: 'You have reached the maximum usage limit for this coupon' };
    }
  }

  if (subtotal < coupon.minBookingAmount) {
    return { valid: false, message: `Minimum booking amount of ${coupon.minBookingAmount} required for this coupon` };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  if (discountAmount > subtotal) {
    discountAmount = subtotal;
  }

  return { valid: true, message: 'Coupon applied successfully', discountAmount };
}

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body as any;
    const userId = req.user?.sub;

    const booking = await Booking.findById(id).lean();
    if (!booking) {
      return responseHandler.notFound(res, 'Booking');
    }

    if (booking.status === 'cancelled') {
      return responseHandler.error(res, 'Booking is already cancelled', 400, 'BOOKING_003');
    }

    if (booking.status === 'checked_out') {
      return responseHandler.error(res, 'Cannot cancel a completed booking', 400, 'BOOKING_004');
    }

    const isAdmin = req.user?.permissions?.includes('booking:manage') || req.user?.permissions?.includes('*:*');
    if (!isAdmin && booking.customerId.toString() !== userId) {
      return responseHandler.forbidden(res, 'You can only cancel your own bookings');
    }

    const cancelledBooking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        specialRequests: reason || booking.specialRequests,
      },
      { new: true }
    ).lean();

    await updateRoomStatusForBooking(id, 'cancelled');

    return responseHandler.success(res, cancelledBooking, 'Booking cancelled successfully');
  } catch (error) {
    return next(error);
  }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body as any;

    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled', 'failed'],
      confirmed: ['checked_in', 'cancelled'],
      checked_in: ['checked_out', 'cancelled'],
      checked_out: [],
      cancelled: [],
      failed: [],
    };

    const existingBooking = await Booking.findById(id).lean();
    if (!existingBooking) {
      return responseHandler.notFound(res, 'Booking');
    }

    const currentStatus = existingBooking.status;
    if (currentStatus === 'cancelled' || currentStatus === 'checked_out') {
      return responseHandler.error(res, `Cannot change status from ${currentStatus}`, 400, 'BOOKING_002');
    }

    if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(status)) {
      return responseHandler.error(res, `Invalid status transition from ${currentStatus} to ${status}`, 400, 'BOOKING_002');
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status, specialRequests: reason ? (req.body as any).specialRequests : undefined },
      { new: true }
    ).lean();

    await updateRoomStatusForBooking(id, status);

    return responseHandler.success(res, booking, 'Booking status updated successfully');
  } catch (error) {
    return next(error);
  }
};
