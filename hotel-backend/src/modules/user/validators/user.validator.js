import { z } from 'zod';

// Create user schema (admin creating staff/admin users)
export const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Update user schema
export const updateUserSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  preferences: z.record(z.any()).optional(),
});

// User query schema
export const userQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'deleted']).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export default createUserSchema;
