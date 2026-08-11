import { z } from 'zod';

const dateStringSchema = z.string().min(1, 'Date is required');

export const createBookingSchema = z.object({
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid customer ID'),
  guestDetails: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone number is required'),
    country: z.string().optional(),
    specialRequests: z.string().optional(),
  }),
  checkIn: dateStringSchema,
  checkOut: dateStringSchema,
  rooms: z.array(
    z.object({
      roomId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid room ID'),
      roomType: z.string().min(1, 'Room type name is required'),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      price: z.number().min(0, 'Price must be non-negative'),
    })
  ).min(1, 'At least one room is required'),
  pricing: z.object({
    subtotal: z.number().min(0, 'Subtotal must be non-negative'),
    tax: z.number().min(0, 'Tax must be non-negative'),
    discount: z.number().min(0, 'Discount must be non-negative').default(0),
    total: z.number().min(0, 'Total must be non-negative'),
  }).optional(),
  specialRequests: z.string().optional(),
  source: z.enum(['website', 'mobile_app', 'walk_in', 'ota']).optional(),
  bookingReference: z.string().optional(),
});

export const bookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed']).optional(),
  paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).optional(),
  customerId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'failed']),
  reason: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
