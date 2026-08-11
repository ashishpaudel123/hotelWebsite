"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusSchema = exports.bookingQuerySchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
const dateStringSchema = zod_1.z.string().min(1, 'Date is required');
exports.createBookingSchema = zod_1.z.object({
    customerId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID'),
    guestDetails: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        email: zod_1.z.string().email('Invalid email format'),
        phone: zod_1.z.string().min(1, 'Phone number is required'),
        country: zod_1.z.string().optional(),
        specialRequests: zod_1.z.string().optional(),
    }),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    rooms: zod_1.z.array(zod_1.z.object({
        roomId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID'),
        roomType: zod_1.z.string().min(1, 'Room type name is required'),
        quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
        price: zod_1.z.number().min(0, 'Price must be non-negative'),
    })).min(1, 'At least one room is required'),
    pricing: zod_1.z.object({
        subtotal: zod_1.z.number().min(0, 'Subtotal must be non-negative'),
        tax: zod_1.z.number().min(0, 'Tax must be non-negative'),
        discount: zod_1.z.number().min(0, 'Discount must be non-negative').default(0),
        total: zod_1.z.number().min(0, 'Total must be non-negative'),
    }).optional(),
    specialRequests: zod_1.z.string().optional(),
    source: zod_1.z.enum(['website', 'mobile_app', 'walk_in', 'ota']).optional(),
    bookingReference: zod_1.z.string().optional(),
});
exports.bookingQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    status: zod_1.z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed']).optional(),
    paymentStatus: zod_1.z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
    customerId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().default('createdAt'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.updateBookingStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed']),
    reason: zod_1.z.string().optional(),
});
//# sourceMappingURL=booking.validator.js.map