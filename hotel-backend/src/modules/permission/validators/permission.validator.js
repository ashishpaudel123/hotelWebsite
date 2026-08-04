import { z } from 'zod';

// Create permission schema
export const createPermissionSchema = z.object({
  name: z.string().min(2, 'Permission name must be at least 2 characters'),
  resource: z.string().min(1, 'Resource is required'),
  action: z.enum(['read', 'write', 'update', 'delete', 'manage', 'all']),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  isSystem: z.boolean().default(false), // System permissions cannot be deleted
});

// Update permission schema
export const updatePermissionSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

// Permission query schema
export const permissionQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).default('1'),
  limit: z.string().transform((val) => parseInt(val, 10)).default('50'),
  resource: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
  sortBy: z.string().default('resource'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export default createPermissionSchema;
