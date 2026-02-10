const RoleRepository = require("../repositories/RoleRepository");
const AuditLogRepository = require("../repositories/AuditLogRepository");

class RoleService {
  constructor(models) {
    this.models = models;
    this.roleRepository = new RoleRepository(models.Role);
    this.auditLogRepository = new AuditLogRepository(models.AuditLog);
  }

  /**
   * Create role
   */
  async createRole(roleData, createdBy) {
    try {
      const { code, name, description, status = "active" } = roleData;

      // Check if role already exists
      const existingRole = await this.roleRepository.findByCode(code);
      if (existingRole) {
        throw new Error("Role with this code already exists");
      }

      const newRole = await this.roleRepository.create({
        code,
        name,
        description,
        status,
        createdBy,
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: createdBy,
        module: "RoleManagement",
        action: "CREATE",
        entityType: "Role",
        entityId: newRole.id,
        newValues: { code, name, description, status },
        status: "success",
        description: `Role ${code} created`,
      });

      return newRole;
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  /**
   * Get role by ID with permissions
   */
  async getRoleById(roleId) {
    try {
      return await this.roleRepository.findRoleWithPermissions(roleId);
    } catch (error) {
      throw new Error(`Error getting role: ${error.message}`);
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId, updateData, updatedBy) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }

      if (role.isSystem && updateData.code !== role.code) {
        throw new Error("System roles cannot be modified");
      }

      const oldValues = {
        name: role.name,
        description: role.description,
        status: role.status,
      };

      const updatedRole = await this.roleRepository.update(roleId, updateData);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: updatedBy,
        module: "RoleManagement",
        action: "UPDATE",
        entityType: "Role",
        entityId: roleId,
        oldValues,
        newValues: updateData,
        status: "success",
        description: `Role ${role.code} updated`,
      });

      return updatedRole;
    } catch (error) {
      throw new Error(`Error updating role: ${error.message}`);
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId, deletedBy) {
    try {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }

      if (role.isSystem) {
        throw new Error("System roles cannot be deleted");
      }

      // Check if role is assigned to users
      const rolesData = await this.roleRepository.findRoleUsers(roleId);
      if (rolesData.users.length > 0) {
        throw new Error("Cannot delete role that is assigned to users");
      }

      await this.roleRepository.delete(roleId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: deletedBy,
        module: "RoleManagement",
        action: "DELETE",
        entityType: "Role",
        entityId: roleId,
        oldValues: {
          code: role.code,
          name: role.name,
        },
        status: "success",
        description: `Role ${role.code} deleted`,
      });

      return { message: "Role deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting role: ${error.message}`);
    }
  }

  /**
   * List roles
   */
  async listRoles(options = {}) {
    try {
      return await this.roleRepository.paginate({
        ...options,
        order: [["priority", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Error listing roles: ${error.message}`);
    }
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId, permissionId, assignedBy) {
    try {
      await this.roleRepository.assignPermission(roleId, permissionId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: assignedBy,
        module: "RoleManagement",
        action: "ASSIGN_PERMISSION",
        entityType: "RolePermission",
        entityId: `${roleId}-${permissionId}`,
        newValues: { roleId, permissionId },
        status: "success",
        description: `Permission assigned to role ${roleId}`,
      });

      return { message: "Permission assigned to role successfully" };
    } catch (error) {
      throw new Error(
        `Error assigning permission to role: ${error.message}`,
      );
    }
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId, permissionId, removedBy) {
    try {
      await this.roleRepository.removePermission(roleId, permissionId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: removedBy,
        module: "RoleManagement",
        action: "REMOVE_PERMISSION",
        entityType: "RolePermission",
        entityId: `${roleId}-${permissionId}`,
        oldValues: { roleId, permissionId },
        status: "success",
        description: `Permission removed from role ${roleId}`,
      });

      return { message: "Permission removed from role successfully" };
    } catch (error) {
      throw new Error(
        `Error removing permission from role: ${error.message}`,
      );
    }
  }

  /**
   * Assign multiple permissions to role
   */
  async assignPermissionsToRole(roleId, permissionIds, assignedBy) {
    try {
      await this.roleRepository.assignPermissions(roleId, permissionIds);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: assignedBy,
        module: "RoleManagement",
        action: "ASSIGN_PERMISSIONS",
        entityType: "RolePermission",
        entityId: roleId,
        newValues: { roleId, permissionIds },
        status: "success",
        description: `${permissionIds.length} permissions assigned to role ${roleId}`,
      });

      return { message: "Permissions assigned successfully" };
    } catch (error) {
      throw new Error(
        `Error assigning permissions to role: ${error.message}`,
      );
    }
  }

  /**
   * Search roles
   */
  async searchRoles(searchTerm, options = {}) {
    try {
      return await this.roleRepository.searchRoles(searchTerm, options);
    } catch (error) {
      throw new Error(`Error searching roles: ${error.message}`);
    }
  }

  /**
   * Get system roles
   */
  async getSystemRoles(options = {}) {
    try {
      return await this.roleRepository.getSystemRoles(options);
    } catch (error) {
      throw new Error(`Error getting system roles: ${error.message}`);
    }
  }
}

module.exports = RoleService;
