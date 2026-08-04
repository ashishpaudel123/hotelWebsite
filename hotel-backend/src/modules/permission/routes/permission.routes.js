import { Router } from 'express';
import { protect, authorize, checkPermission } from '../../../middleware/auth.middleware.js';
import { validateWithZod } from '../../../middleware/validation.middleware.js';
import { asyncHandler } from '../../../utils/responseHandler.js';
import permissionService from '../services/permission.service.js';
import { 
  createPermissionSchema, 
  updatePermissionSchema, 
  permissionQuerySchema 
} from '../validators/permission.validator.js';

const router = Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('super_admin', 'admin'));

/**
 * @route   POST /api/v1/permissions
 * @desc    Create a new permission
 * @access  Private (Super Admin/Admin only)
 */
router.post('/', 
  validateWithZod(createPermissionSchema),
  asyncHandler(async (req, res) => {
    const permission = await permissionService.createPermission(req.validatedData || req.body, req.user);
    
    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission,
    });
  })
);

/**
 * @route   GET /api/v1/permissions
 * @desc    Get all permissions with pagination
 * @access  Private (Super Admin/Admin only)
 */
router.get('/', 
  asyncHandler(async (req, res) => {
    const query = {};
    
    // Build query from request params
    if (req.query.resource) query.resource = req.query.resource;
    if (req.query.status) query.status = req.query.status;
    
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await permissionService.getAllPermissions(query, options);
    
    res.json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: result.data,
      meta: result.meta,
    });
  })
);

/**
 * @route   GET /api/v1/permissions/:id
 * @desc    Get permission by ID
 * @access  Private (Super Admin/Admin only)
 */
router.get('/:id',
  asyncHandler(async (req, res) => {
    const permission = await permissionService.getPermissionById(req.params.id);
    
    res.json({
      success: true,
      message: 'Permission retrieved successfully',
      data: permission,
    });
  })
);

/**
 * @route   PUT /api/v1/permissions/:id
 * @desc    Update permission
 * @access  Private (Super Admin/Admin only)
 */
router.put('/:id',
  validateWithZod(updatePermissionSchema),
  asyncHandler(async (req, res) => {
    const permission = await permissionService.updatePermission(
      req.params.id, 
      req.validatedData || req.body, 
      req.user
    );
    
    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    });
  })
);

/**
 * @route   DELETE /api/v1/permissions/:id
 * @desc    Delete permission (soft delete)
 * @access  Private (Super Admin only)
 */
router.delete('/:id',
  authorize('super_admin'),
  asyncHandler(async (req, res) => {
    await permissionService.deletePermission(req.params.id, req.user);
    
    res.status(204).json({
      success: true,
      message: 'Permission deleted successfully',
    });
  })
);

/**
 * @route   GET /api/v1/permissions/resource/:resource
 * @desc    Get permissions by resource
 * @access  Private (Super Admin/Admin only)
 */
router.get('/resource/:resource',
  asyncHandler(async (req, res) => {
    const permissions = await permissionService.getPermissionsByResource(req.params.resource);
    
    res.json({
      success: true,
      message: 'Permissions retrieved successfully',
      data: permissions,
    });
  })
);

/**
 * @route   POST /api/v1/permissions/initialize
 * @desc    Initialize default system permissions
 * @access  Private (Super Admin only)
 */
router.post('/initialize',
  authorize('super_admin'),
  asyncHandler(async (req, res) => {
    const result = await permissionService.initializeDefaultPermissions();
    
    res.json({
      success: true,
      message: 'Default permissions initialized successfully',
      data: { count: Array.isArray(result) ? result.length : result },
    });
  })
);

export default router;
