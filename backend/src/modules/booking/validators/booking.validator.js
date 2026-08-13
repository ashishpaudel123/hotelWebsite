const { z } = require('zod');

// Base date validation
const dateSchema = z.string().transform((val) => new Date(val));

// Guest details schema
const guestDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().optional(),
  specialRequests: z.string().optional()
});

// Room item schema
const roomItemSchema = z.object({
  roomTypeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room type ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  pricePerNight: z.number().positive('Price must be positive'),
  totalNights: z.number().int().positive()
});

// Create booking schema
const createBookingSchema = z.object({
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID'),
  guestDetails: guestDetailsSchema,
  checkIn: dateSchema,
  checkOut: dateSchema,
  rooms: z.array(roomItemSchema).min(1, 'At least one room is required'),
  couponCode: z.string().optional(),
  specialRequests: z.string().optional(),
  source: z.enum(['website', 'mobile_app', 'walk_in', 'ota']).optional(),
  metadata: z.object({
    ipAddress: z.string().optional(),
    userAgent: z.string().optional()
  }).optional()
});

// Availability check schema
const availabilityCheckSchema = z.object({
  checkIn: dateSchema,
  checkOut: dateSchema,
  roomTypeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room type ID'),
  quantity: z.number().int().positive().default(1)
});

// Cancel booking schema
const cancelBookingSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  reason: z.string().optional(),
  requestedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
});

// Update booking status schema
const updateBookingStatusSchema = z.object({
  bookingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid booking ID'),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed']),
  reason: z.string().optional(),
  updatedBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
});

// Query parameters schema for listing
const bookingQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val)).default('1'),
  limit: z.string().transform((val) => parseInt(val)).default('10'),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed']).optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
  checkInStart: dateSchema.optional(),
  checkInEnd: dateSchema.optional(),
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

module.exports = {
  createBookingSchema,
  availabilityCheckSchema,
  cancelBookingSchema,
  updateBookingStatusSchema,
  bookingQuerySchema,
  guestDetailsSchema,
  roomItemSchema
};
