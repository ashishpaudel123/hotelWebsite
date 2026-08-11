"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.cancelBooking = exports.getBookingByReference = exports.checkAvailability = exports.createBooking = exports.getBookingById = exports.getBookings = void 0;
const responseHandler_1 = require("../../../utils/responseHandler");
const regex_1 = require("../../../utils/regex");
const models_1 = require("../../../models");
const TAX_RATE = 0.13;
function calculateNights(checkIn, checkOut) {
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round(Math.abs((checkOut.getTime() - checkIn.getTime()) / oneDay));
    return Math.max(nights, 1);
}
async function checkBookingOverlap(roomId, checkIn, checkOut, excludeBookingId) {
    const conflictQuery = {
        rooms: { $elemMatch: { roomId: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(roomId) } },
        status: { $in: ['pending', 'confirmed', 'checked_in'] },
        $or: [
            { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
        ],
    };
    if (excludeBookingId) {
        conflictQuery._id = { $ne: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(excludeBookingId) };
    }
    const conflictingBooking = await models_1.Booking.findOne(conflictQuery).lean();
    return !!conflictingBooking;
}
async function calculateServerPricing(rooms, checkIn, checkOut) {
    const nights = calculateNights(checkIn, checkOut);
    let subtotal = 0;
    for (const room of rooms) {
        const roomDoc = await models_1.Room.findById(room.roomId).lean();
        if (!roomDoc) {
            throw new Error(`Room not found for room ${room.roomId}`);
        }
        const roomType = await models_1.RoomType.findById(roomDoc.roomType).lean();
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
const getBookings = async (req, res, next) => {
    try {
        const { page, limit, status, paymentStatus, customerId, search, sortBy, sortOrder } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (paymentStatus)
            filter.paymentStatus = paymentStatus;
        if (customerId)
            filter.customerId = customerId;
        if (search) {
            const sanitizedSearch = (0, regex_1.sanitizeRegex)(search);
            filter.$or = [
                { bookingReference: { $regex: sanitizedSearch, $options: 'i' } },
                { 'guestDetails.email': { $regex: sanitizedSearch, $options: 'i' } },
            ];
        }
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 20;
        const skip = (pageNum - 1) * limitNum;
        const [bookings, total] = await Promise.all([
            models_1.Booking.find(filter)
                .populate('customerId', 'firstName lastName email')
                .sort({ [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            models_1.Booking.countDocuments(filter),
        ]);
        return responseHandler_1.responseHandler.success(res, bookings, 'Bookings retrieved successfully', 200, {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.getBookings = getBookings;
const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await models_1.Booking.findById(id)
            .populate('customerId', 'firstName lastName email phone')
            .lean();
        if (!booking) {
            return responseHandler_1.responseHandler.notFound(res, 'Booking');
        }
        const isAdmin = req.user?.permissions?.includes('booking:manage') || req.user?.permissions?.includes('*:*') || req.user?.role === 'admin' || req.user?.role === 'staff';
        if (!isAdmin && booking.customerId && booking.customerId._id?.toString() !== req.user?.sub) {
            return responseHandler_1.responseHandler.forbidden(res, 'You can only view your own bookings');
        }
        return responseHandler_1.responseHandler.success(res, booking, 'Booking retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getBookingById = getBookingById;
const createBooking = async (req, res, next) => {
    try {
        const body = req.body;
        const checkIn = new Date(body.checkIn);
        const checkOut = new Date(body.checkOut);
        if (isNaN(checkIn.getTime())) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'checkIn', message: 'Invalid check-in date' }]);
        }
        if (isNaN(checkOut.getTime())) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'checkOut', message: 'Invalid check-out date' }]);
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (checkIn < today) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'checkIn', message: 'Check-in date cannot be in the past' }]);
        }
        if (checkOut <= checkIn) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'checkOut', message: 'Check-out date must be after check-in date' }]);
        }
        const rooms = body.rooms;
        if (!rooms || rooms.length === 0) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'rooms', message: 'At least one room is required' }]);
        }
        for (const room of rooms) {
            const roomDoc = await models_1.Room.findById(room.roomId).lean();
            if (!roomDoc) {
                return responseHandler_1.responseHandler.validation(res, [{ field: 'rooms', message: `Room ${room.roomId} not found` }]);
            }
            const isOverlapping = await checkBookingOverlap(room.roomId, checkIn, checkOut);
            if (isOverlapping) {
                return responseHandler_1.responseHandler.conflict(res, `Room ${roomDoc.roomNumber} is already booked for the selected dates`);
            }
            const roomType = await models_1.RoomType.findById(roomDoc.roomType).lean();
            if (!roomType) {
                return responseHandler_1.responseHandler.validation(res, [{ field: 'rooms', message: `Room type not found for room ${room.roomId}` }]);
            }
            const totalGuests = (room.adults || 0) + (room.children || 0);
            if (totalGuests <= 0) {
                return responseHandler_1.responseHandler.validation(res, [{ field: 'rooms', message: `At least one guest is required for room ${roomDoc.roomNumber}` }]);
            }
            if (totalGuests > roomType.maxOccupancy) {
                return responseHandler_1.responseHandler.validation(res, [
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
                return responseHandler_1.responseHandler.validation(res, [
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
                return responseHandler_1.responseHandler.validation(res, [{ field: 'couponCode', message: couponResult.message }]);
            }
            discount = couponResult.discountAmount || 0;
        }
        const nights = calculateNights(checkIn, checkOut);
        const total = serverPricing.subtotal + serverPricing.tax - discount;
        const bookingData = {
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
        const booking = await models_1.Booking.create(bookingData);
        const populated = await models_1.Booking.findById(booking._id)
            .populate('customerId', 'firstName lastName email')
            .lean();
        return responseHandler_1.responseHandler.created(res, populated, 'Booking created successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.createBooking = createBooking;
const checkAvailability = async (req, res, next) => {
    try {
        const { roomId, checkIn, checkOut, quantity = 1 } = req.body;
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'dates', message: 'Invalid date format' }]);
        }
        if (checkOutDate <= checkInDate) {
            return responseHandler_1.responseHandler.validation(res, [{ field: 'checkOut', message: 'Check-out must be after check-in' }]);
        }
        const room = await models_1.Room.findById(roomId).lean();
        if (!room) {
            return responseHandler_1.responseHandler.notFound(res, 'Room');
        }
        const isOverlapping = await checkBookingOverlap(roomId, checkInDate, checkOutDate);
        if (isOverlapping) {
            return responseHandler_1.responseHandler.success(res, {
                available: false,
                message: 'Room is not available for the selected dates',
                quantity,
            });
        }
        return responseHandler_1.responseHandler.success(res, {
            available: true,
            message: 'Room is available for the selected dates',
            quantity,
        });
    }
    catch (error) {
        return next(error);
    }
};
exports.checkAvailability = checkAvailability;
async function updateRoomStatusForBooking(bookingId, status) {
    const booking = await models_1.Booking.findById(bookingId).lean();
    if (!booking)
        return;
    const roomIds = booking.rooms.map((r) => r.roomId);
    if (status === 'checked_in') {
        await models_1.Room.updateMany({ _id: { $in: roomIds } }, { status: 'occupied', currentBooking: booking._id });
    }
    else if (status === 'checked_out' || status === 'cancelled') {
        await models_1.Room.updateMany({ _id: { $in: roomIds }, currentBooking: booking._id }, { status: 'available', currentBooking: undefined });
    }
}
const getBookingByReference = async (req, res, next) => {
    try {
        const { ref } = req.params;
        const booking = await models_1.Booking.findOne({ bookingReference: ref.toUpperCase() })
            .populate('customerId', 'firstName lastName email phone')
            .lean();
        if (!booking) {
            return responseHandler_1.responseHandler.notFound(res, 'Booking');
        }
        return responseHandler_1.responseHandler.success(res, booking, 'Booking retrieved successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.getBookingByReference = getBookingByReference;
async function validateAndApplyCoupon(code, subtotal, customerId) {
    const coupon = await models_1.Coupon.findOne({ code: code.toUpperCase(), status: 'active' });
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
        const userUsageCount = await models_1.Booking.countDocuments({
            customerId: new (await Promise.resolve().then(() => __importStar(require('mongoose')))).default.Types.ObjectId(customerId),
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
    }
    else {
        discountAmount = coupon.discountValue;
    }
    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }
    return { valid: true, message: 'Coupon applied successfully', discountAmount };
}
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user?.sub;
        const booking = await models_1.Booking.findById(id).lean();
        if (!booking) {
            return responseHandler_1.responseHandler.notFound(res, 'Booking');
        }
        if (booking.status === 'cancelled') {
            return responseHandler_1.responseHandler.error(res, 'Booking is already cancelled', 400, 'BOOKING_003');
        }
        if (booking.status === 'checked_out') {
            return responseHandler_1.responseHandler.error(res, 'Cannot cancel a completed booking', 400, 'BOOKING_004');
        }
        const isAdmin = req.user?.permissions?.includes('booking:manage') || req.user?.permissions?.includes('*:*');
        if (!isAdmin && booking.customerId.toString() !== userId) {
            return responseHandler_1.responseHandler.forbidden(res, 'You can only cancel your own bookings');
        }
        const cancelledBooking = await models_1.Booking.findByIdAndUpdate(id, {
            status: 'cancelled',
            specialRequests: reason || booking.specialRequests,
        }, { new: true }).lean();
        await updateRoomStatusForBooking(id, 'cancelled');
        return responseHandler_1.responseHandler.success(res, cancelledBooking, 'Booking cancelled successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.cancelBooking = cancelBooking;
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const allowedTransitions = {
            pending: ['confirmed', 'cancelled', 'failed'],
            confirmed: ['checked_in', 'cancelled'],
            checked_in: ['checked_out', 'cancelled'],
            checked_out: [],
            cancelled: [],
            failed: [],
        };
        const existingBooking = await models_1.Booking.findById(id).lean();
        if (!existingBooking) {
            return responseHandler_1.responseHandler.notFound(res, 'Booking');
        }
        const currentStatus = existingBooking.status;
        if (currentStatus === 'cancelled' || currentStatus === 'checked_out') {
            return responseHandler_1.responseHandler.error(res, `Cannot change status from ${currentStatus}`, 400, 'BOOKING_002');
        }
        if (allowedTransitions[currentStatus] && !allowedTransitions[currentStatus].includes(status)) {
            return responseHandler_1.responseHandler.error(res, `Invalid status transition from ${currentStatus} to ${status}`, 400, 'BOOKING_002');
        }
        const booking = await models_1.Booking.findByIdAndUpdate(id, { status, specialRequests: reason ? req.body.specialRequests : undefined }, { new: true }).lean();
        await updateRoomStatusForBooking(id, status);
        return responseHandler_1.responseHandler.success(res, booking, 'Booking status updated successfully');
    }
    catch (error) {
        return next(error);
    }
};
exports.updateBookingStatus = updateBookingStatus;
//# sourceMappingURL=booking.controller.js.map