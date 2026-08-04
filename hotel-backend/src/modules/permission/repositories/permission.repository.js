import Permission from '../../models/Permission.js';
import logger from '../../utils/logger.js';

class PermissionRepository {
  /**
   * Create a new permission
   */
  async create(permissionData) {
    try {
      const permission = await Permission.create(permissionData);
      return permission;
    } catch (error) {
      logger.error(`PermissionRepository - create: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find permission by ID
   */
  async findById(id) {
    try {
      return await Permission.findById(id).exec();
    } catch (error) {
      logger.error(`PermissionRepository - findById: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all permissions with pagination and filtering
   */
  async findAll(query = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'resource',
        sortOrder = 'asc',
      } = options;

      const skip = (page - 1) * limit;
      
      // Build query - exclude deleted if not specified
      const finalQuery = {
        ...query,
        isDeleted: query.isDeleted || false,
      };

      const [permissions, total] = await Promise.all([
        Permission.find(finalQuery)
          .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Permission.countDocuments(finalQuery),
      ]);

      return {
        data: permissions,
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error(`PermissionRepository - findAll: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update permission by ID
   */
  async update(id, updateData, updatedBy) {
    try {
      const permission = await Permission.findByIdAndUpdate(
        id,
        { 
          ...updateData, 
          updatedBy,
        },
        { 
          new: true, 
          runValidators: true 
        }
      );
      return permission;
    } catch (error) {
      logger.error(`PermissionRepository - update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Soft delete permission
   */
  async delete(id, deletedBy) {
    try {
      const permission = await Permission.findById(id);
      
      if (!permission) {
        return null;
      }

      if (permission.isSystem) {
        throw new Error('Cannot delete system permissions');
      }

      permission.isDeleted = true;
      permission.deletedAt = new Date();
      permission.updatedBy = deletedBy;
      await permission.save();

      return permission;
    } catch (error) {
      logger.error(`PermissionRepository - delete: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find permissions by resource
   */
  async findByResource(resource) {
    try {
      return await Permission.find({ 
        resource, 
        isDeleted: false 
      }).exec();
    } catch (error) {
      logger.error(`PermissionRepository - findByResource: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk create permissions (for seeding)
   */
  async bulkCreate(permissions) {
    try {
      return await Permission.insertMany(permissions, { ordered: false });
    } catch (error) {
      // Ignore duplicate key errors during bulk insert
      if (error.code === 11000) {
        logger.info('Some permissions already exist, continuing...');
        return error.result?.nInserted || 0;
      }
      throw error;
    }
  }

  /**
   * Get all active permissions for caching
   */
  async getAllActive() {
    try {
      return await Permission.find({ 
        status: 'active', 
        isDeleted: false 
      }).exec();
    } catch (error) {
      logger.error(`PermissionRepository - getAllActive: ${error.message}`);
      throw error;
    }
  }
}

export default new PermissionRepository();
