const PermissionRepository = require("../repositories/PermissionRepository");
const AuditLogRepository = require("../repositories/AuditLogRepository");

class PermissionService {
  constructor(models) {
    this.models = models;
    this.permissionRepository = new PermissionRepository(models.Permission);
    this.auditLogRepository = new AuditLogRepository(models.AuditLog);
  }

  /**
   * Create permission
   */
  async createPermission(permissionData, createdBy) {
    try {
      const { code, name, module, resource, action, description } =
        permissionData;

      // Check if permission already exists
      const existingPermission = await this.permissionRepository.findByCode(
        code,
      );
      if (existingPermission) {
        throw new Error("Permission with this code already exists");
      }

      const newPermission = await this.permissionRepository.create({
        code,
        name,
        module,
        resource,
        action,
        description,
        status: "active",
        createdBy,
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: createdBy,
        module: "PermissionManagement",
        action: "CREATE",
        entityType: "Permission",
        entityId: newPermission.id,
        newValues: { code, name, module, resource, action },
        status: "success",
        description: `Permission ${code} created`,
      });

      return newPermission;
    } catch (error) {
      throw new Error(`Error creating permission: ${error.message}`);
    }
  }

  /**
   * Get permission by ID
   */
  async getPermissionById(permissionId) {
    try {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw new Error("Permission not found");
      }
      return permission;
    } catch (error) {
      throw new Error(`Error getting permission: ${error.message}`);
    }
  }

  /**
   * Update permission
   */
  async updatePermission(permissionId, updateData, updatedBy) {
    try {
      const permission = await this.permissionRepository.findById(
        permissionId,
      );
      if (!permission) {
        throw new Error("Permission not found");
      }

      if (permission.isSystem) {
        throw new Error("System permissions cannot be modified");
      }

      const oldValues = {
        name: permission.name,
        description: permission.description,
        status: permission.status,
      };

      const updatedPermission = await this.permissionRepository.update(
        permissionId,
        updateData,
      );

      // Log audit
      await this.auditLogRepository.logAction({
        userId: updatedBy,
        module: "PermissionManagement",
        action: "UPDATE",
        entityType: "Permission",
        entityId: permissionId,
        oldValues,
        newValues: updateData,
        status: "success",
        description: `Permission ${permission.code} updated`,
      });

      return updatedPermission;
    } catch (error) {
      throw new Error(`Error updating permission: ${error.message}`);
    }
  }

  /**
   * Delete permission
   */
  async deletePermission(permissionId, deletedBy) {
    try {
      const permission = await this.permissionRepository.findById(
        permissionId,
      );
      if (!permission) {
        throw new Error("Permission not found");
      }

      if (permission.isSystem) {
        throw new Error("System permissions cannot be deleted");
      }

      await this.permissionRepository.delete(permissionId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: deletedBy,
        module: "PermissionManagement",
        action: "DELETE",
        entityType: "Permission",
        entityId: permissionId,
        oldValues: {
          code: permission.code,
          name: permission.name,
        },
        status: "success",
        description: `Permission ${permission.code} deleted`,
      });

      return { message: "Permission deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting permission: ${error.message}`);
    }
  }

  /**
   * List permissions
   */
  async listPermissions(options = {}) {
    try {
      return await this.permissionRepository.paginate({
        ...options,
        order: [["module", "ASC"], ["resource", "ASC"], ["action", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Error listing permissions: ${error.message}`);
    }
  }

  /**
   * Get permissions by module
   */
  async getPermissionsByModule(module, options = {}) {
    try {
      return await this.permissionRepository.findByModule(module, options);
    } catch (error) {
      throw new Error(
        `Error getting permissions by module: ${error.message}`,
      );
    }
  }

  /**
   * Get permissions by resource
   */
  async getPermissionsByResource(resource, options = {}) {
    try {
      return await this.permissionRepository.findByResource(resource, options);
    } catch (error) {
      throw new Error(
        `Error getting permissions by resource: ${error.message}`,
      );
    }
  }

  /**
   * Search permissions
   */
  async searchPermissions(searchTerm, options = {}) {
    try {
      return await this.permissionRepository.searchPermissions(
        searchTerm,
        options,
      );
    } catch (error) {
      throw new Error(`Error searching permissions: ${error.message}`);
    }
  }

  /**
   * Get system permissions
   */
  async getSystemPermissions(options = {}) {
    try {
      return await this.permissionRepository.getSystemPermissions(options);
    } catch (error) {
      throw new Error(`Error getting system permissions: ${error.message}`);
    }
  }

  /**
   * Group permissions by module
   */
  async groupPermissionsByModule(options = {}) {
    try {
      return await this.permissionRepository.groupByModule(options);
    } catch (error) {
      throw new Error(
        `Error grouping permissions by module: ${error.message}`,
      );
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId) {
    try {
      const permissions =
        await this.permissionRepository.findUserPermissions(userId);
      return permissions;
    } catch (error) {
      throw new Error(`Error getting user permissions: ${error.message}`);
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(roleId) {
    try {
      const permissions =
        await this.permissionRepository.findRolePermissions(roleId);
      return permissions;
    } catch (error) {
      throw new Error(`Error getting role permissions: ${error.message}`);
    }
  }
}

module.exports = PermissionService;
