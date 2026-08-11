import { z } from 'zod';
export declare const createBookingSchema: z.ZodObject<{
    customerId: z.ZodString;
    guestDetails: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodString;
        country: z.ZodOptional<z.ZodString>;
        specialRequests: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        specialRequests?: string | undefined;
        country?: string | undefined;
    }, {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        specialRequests?: string | undefined;
        country?: string | undefined;
    }>;
    checkIn: z.ZodString;
    checkOut: z.ZodString;
    rooms: z.ZodArray<z.ZodObject<{
        roomId: z.ZodString;
        roomType: z.ZodString;
        quantity: z.ZodNumber;
        price: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        roomType: string;
        price: number;
        roomId: string;
        quantity: number;
    }, {
        roomType: string;
        price: number;
        roomId: string;
        quantity: number;
    }>, "many">;
    pricing: z.ZodOptional<z.ZodObject<{
        subtotal: z.ZodNumber;
        tax: z.ZodNumber;
        discount: z.ZodDefault<z.ZodNumber>;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        total: number;
        subtotal: number;
        tax: number;
        discount: number;
    }, {
        total: number;
        subtotal: number;
        tax: number;
        discount?: number | undefined;
    }>>;
    specialRequests: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodEnum<["website", "mobile_app", "walk_in", "ota"]>>;
    bookingReference: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    rooms: {
        roomType: string;
        price: number;
        roomId: string;
        quantity: number;
    }[];
    customerId: string;
    guestDetails: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        specialRequests?: string | undefined;
        country?: string | undefined;
    };
    checkIn: string;
    checkOut: string;
    bookingReference?: string | undefined;
    pricing?: {
        total: number;
        subtotal: number;
        tax: number;
        discount: number;
    } | undefined;
    specialRequests?: string | undefined;
    source?: "website" | "mobile_app" | "walk_in" | "ota" | undefined;
}, {
    rooms: {
        roomType: string;
        price: number;
        roomId: string;
        quantity: number;
    }[];
    customerId: string;
    guestDetails: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        specialRequests?: string | undefined;
        country?: string | undefined;
    };
    checkIn: string;
    checkOut: string;
    bookingReference?: string | undefined;
    pricing?: {
        total: number;
        subtotal: number;
        tax: number;
        discount?: number | undefined;
    } | undefined;
    specialRequests?: string | undefined;
    source?: "website" | "mobile_app" | "walk_in" | "ota" | undefined;
}>;
export declare const bookingQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "checked_in", "checked_out", "cancelled", "failed"]>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<["unpaid", "partial", "paid", "refunded"]>>;
    customerId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    status?: "cancelled" | "pending" | "confirmed" | "checked_in" | "checked_out" | "failed" | undefined;
    search?: string | undefined;
    customerId?: string | undefined;
    paymentStatus?: "partial" | "unpaid" | "paid" | "refunded" | undefined;
}, {
    status?: "cancelled" | "pending" | "confirmed" | "checked_in" | "checked_out" | "failed" | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    customerId?: string | undefined;
    paymentStatus?: "partial" | "unpaid" | "paid" | "refunded" | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const updateBookingStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending", "confirmed", "checked_in", "checked_out", "cancelled", "failed"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "confirmed" | "checked_in" | "checked_out" | "failed";
    reason?: string | undefined;
}, {
    status: "cancelled" | "pending" | "confirmed" | "checked_in" | "checked_out" | "failed";
    reason?: string | undefined;
}>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
//# sourceMappingURL=booking.validator.d.ts.map