import permissionRepository from '../repositories/permission.repository.js';
import logger from '../../../utils/logger.js';

class PermissionService {
  /**
   * Create a new permission
   */
  async createPermission(data, user) {
    try {
      const permissionData = {
        ...data,
        createdBy: user._id,
        updatedBy: user._id,
      };

      const permission = await permissionRepository.create(permissionData);
      
      logger.info(`Permission created: ${permission.name} by user ${user.email}`);
      
      return permission;
    } catch (error) {
      logger.error(`PermissionService - createPermission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get permission by ID
   */
  async getPermissionById(id) {
    try {
      const permission = await permissionRepository.findById(id);
      
      if (!permission || permission.isDeleted) {
        throw new Error('Permission not found');
      }
      
      return permission;
    } catch (error) {
      logger.error(`PermissionService - getPermissionById: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all permissions with pagination
   */
  async getAllPermissions(query = {}, options = {}) {
    try {
      const result = await permissionRepository.findAll(query, options);
      return result;
    } catch (error) {
      logger.error(`PermissionService - getAllPermissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update permission
   */
  async updatePermission(id, data, user) {
    try {
      const existingPermission = await permissionRepository.findById(id);
      
      if (!existingPermission || existingPermission.isDeleted) {
        throw new Error('Permission not found');
      }

      if (existingPermission.isSystem && (data.resource || data.action)) {
        throw new Error('Cannot modify resource or action of system permissions');
      }

      const permission = await permissionRepository.update(id, data, user._id);
      
      logger.info(`Permission updated: ${permission.name} by user ${user.email}`);
      
      return permission;
    } catch (error) {
      logger.error(`PermissionService - updatePermission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete permission (soft delete)
   */
  async deletePermission(id, user) {
    try {
      const existingPermission = await permissionRepository.findById(id);
      
      if (!existingPermission) {
        throw new Error('Permission not found');
      }

      if (existingPermission.isSystem) {
        throw new Error('Cannot delete system permissions');
      }

      const permission = await permissionRepository.delete(id, user._id);
      
      logger.info(`Permission deleted: ${existingPermission.name} by user ${user.email}`);
      
      return permission;
    } catch (error) {
      logger.error(`PermissionService - deletePermission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get permissions by resource
   */
  async getPermissionsByResource(resource) {
    try {
      const permissions = await permissionRepository.findByResource(resource);
      return permissions;
    } catch (error) {
      logger.error(`PermissionService - getPermissionsByResource: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize default system permissions
   */
  async initializeDefaultPermissions() {
    try {
      const resources = [
        'dashboard',
        'users',
        'roles',
        'permissions',
        'rooms',
        'room-types',
        'bookings',
        'payments',
        'customers',
        'cms',
        'restaurant',
        'menu',
        'events',
        'gallery',
        'services',
        'blogs',
        'testimonials',
        'reviews',
        'coupons',
        'settings',
        'analytics',
        'audit-logs',
      ];

      const actions = ['read', 'write', 'update', 'delete', 'manage'];
      const permissions = [];

      resources.forEach(resource => {
        actions.forEach(action => {
          permissions.push({
            name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.replace('-', ' ')}`,
            resource,
            action,
            description: `Permission to ${action} ${resource.replace('-', ' ')}`,
            status: 'active',
            isSystem: true,
          });
        });

        // Add 'all' action for each resource
        permissions.push({
          name: `Manage All ${resource.replace('-', ' ')}`,
          resource,
          action: 'all',
          description: `Full access to ${resource.replace('-', ' ')}`,
          status: 'active',
          isSystem: true,
        });
      });

      // Add wildcard permission
      permissions.push({
        name: 'Super Admin Access',
        resource: '*',
        action: '*',
        description: 'Full system access',
        status: 'active',
        isSystem: true,
      });

      const result = await permissionRepository.bulkCreate(permissions);
      logger.info(`Initialized ${result.length || result} default permissions`);
      
      return result;
    } catch (error) {
      logger.error(`PermissionService - initializeDefaultPermissions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all active permissions (for caching)
   */
  async getAllActivePermissions() {
    try {
      return await permissionRepository.getAllActive();
    } catch (error) {
      logger.error(`PermissionService - getAllActivePermissions: ${error.message}`);
      throw error;
    }
  }
}

export default new PermissionService();
