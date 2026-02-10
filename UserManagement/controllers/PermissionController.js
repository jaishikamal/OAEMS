const PermissionService = require("../services/PermissionService");

class PermissionController {
  constructor(models) {
    this.models = models;
    this.permissionService = new PermissionService(models);
  }

  /**
   * Create permission
   */
  async createPermission(req, res) {
    try {
      const { code, name, module, resource, action, description } = req.body;

      if (!code || !name || !module || !resource || !action) {
        return res.status(400).json({
          success: false,
          message:
            "Code, name, module, resource, and action are required",
        });
      }

      const permission = await this.permissionService.createPermission(
        { code, name, module, resource, action, description },
        req.user?.id,
      );

      return res.status(201).json({
        success: true,
        message: "Permission created successfully",
        data: permission,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get permission by ID
   */
  async getPermissionById(req, res) {
    try {
      const { permissionId } = req.params;

      const permission = await this.permissionService.getPermissionById(
        permissionId,
      );

      return res.status(200).json({
        success: true,
        data: permission,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update permission
   */
  async updatePermission(req, res) {
    try {
      const { permissionId } = req.params;

      const permission = await this.permissionService.updatePermission(
        permissionId,
        req.body,
        req.user?.id,
      );

      return res.status(200).json({
        success: true,
        message: "Permission updated successfully",
        data: permission,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete permission
   */
  async deletePermission(req, res) {
    try {
      const { permissionId } = req.params;

      const result = await this.permissionService.deletePermission(
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
   * List permissions
   */
  async listPermissions(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const permissions = await this.permissionService.listPermissions({
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        data: permissions.data,
        pagination: permissions.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get permissions by module
   */
  async getPermissionsByModule(req, res) {
    try {
      const { module } = req.params;

      const permissions = await this.permissionService.getPermissionsByModule(
        module,
      );

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Search permissions
   */
  async searchPermissions(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const permissions = await this.permissionService.searchPermissions(q);

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get system permissions
   */
  async getSystemPermissions(req, res) {
    try {
      const permissions = await this.permissionService.getSystemPermissions();

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Group permissions by module
   */
  async groupPermissionsByModule(req, res) {
    try {
      const permissions =
        await this.permissionService.groupPermissionsByModule();

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(req, res) {
    try {
      const { userId } = req.params;

      const permissions = await this.permissionService.getUserPermissions(
        userId,
      );

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(req, res) {
    try {
      const { roleId } = req.params;

      const permissions = await this.permissionService.getRolePermissions(
        roleId,
      );

      return res.status(200).json({
        success: true,
        data: permissions,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = PermissionController;
