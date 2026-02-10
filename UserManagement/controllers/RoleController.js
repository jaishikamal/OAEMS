const RoleService = require("../services/RoleService");

class RoleController {
  constructor(models) {
    this.models = models;
    this.roleService = new RoleService(models);
  }

  /**
   * Create role
   */
  async createRole(req, res) {
    try {
      const { code, name, description } = req.body;

      if (!code || !name) {
        return res.status(400).json({
          success: false,
          message: "Code and name are required",
        });
      }

      const role = await this.roleService.createRole(
        { code, name, description },
        req.user?.id,
      );

      return res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(req, res) {
    try {
      const { roleId } = req.params;

      const role = await this.roleService.getRoleById(roleId);

      return res.status(200).json({
        success: true,
        data: role,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update role
   */
  async updateRole(req, res) {
    try {
      const { roleId } = req.params;

      const role = await this.roleService.updateRole(
        roleId,
        req.body,
        req.user?.id,
      );

      return res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: role,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete role
   */
  async deleteRole(req, res) {
    try {
      const { roleId } = req.params;

      const result = await this.roleService.deleteRole(roleId, req.user?.id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * List roles
   */
  async listRoles(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const roles = await this.roleService.listRoles({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        data: roles.data,
        pagination: roles.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(req, res) {
    try {
      const { roleId } = req.params;
      const { permissionId } = req.body;

      if (!permissionId) {
        return res.status(400).json({
          success: false,
          message: "Permission ID is required",
        });
      }

      const result = await this.roleService.assignPermissionToRole(
        roleId,
        permissionId,
        req.user?.id,
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(req, res) {
    try {
      const { roleId, permissionId } = req.params;

      const result = await this.roleService.removePermissionFromRole(
        roleId,
        permissionId,
        req.user?.id,
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Assign multiple permissions to role
   */
  async assignPermissionsToRole(req, res) {
    try {
      const { roleId } = req.params;
      const { permissionIds } = req.body;

      if (!permissionIds || !Array.isArray(permissionIds)) {
        return res.status(400).json({
          success: false,
          message: "Permission IDs array is required",
        });
      }

      const result = await this.roleService.assignPermissionsToRole(
        roleId,
        permissionIds,
        req.user?.id,
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Search roles
   */
  async searchRoles(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const roles = await this.roleService.searchRoles(q);

      return res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get system roles
   */
  async getSystemRoles(req, res) {
    try {
      const roles = await this.roleService.getSystemRoles();

      return res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = RoleController;
