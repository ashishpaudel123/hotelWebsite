import { z } from 'zod';

// Create role schema
export const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  slug: z.string().min(2, 'Role slug must be at least 2 characters')
    .regex(/^[a-z0-9_-]+$/, 'Slug must contain only lowercase letters, numbers, hyphens, and underscores'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  accessLevel: z.number().int().min(1).max(100).default(1),
  canApproveBookings: z.boolean().default(false),
  canManagePayments: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Update role schema
export const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  accessLevel: z.number().int().min(1).max(100).optional(),
  canApproveBookings: z.boolean().optional(),
  canManagePayments: z.boolean().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Role query schema
export const roleQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Assign permissions schema
export const assignPermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export default createRoleSchema;
