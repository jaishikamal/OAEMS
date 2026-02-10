const UserService = require("../services/UserService");
const UserValidator = require("../validators/UserValidator");

class UserController {
  constructor(models) {
    this.models = models;
    this.userService = new UserService(models);
    this.validator = new UserValidator();
  }

  /**
   * Create user
   */
  async createUser(req, res) {
    try {
      // Validate request
      const { error, value } = this.validator.validateCreateUser(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const user = await this.userService.createUser(value, req.user?.id);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.params;

      const user = await this.userService.getUserById(userId);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const { error, value } = this.validator.validateUpdateUser(req.body);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }

      const user = await this.userService.updateUser(userId, value, req.user?.id);

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const result = await this.userService.deleteUser(userId, req.user?.id);

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
   * List users
   */
  async listUsers(req, res) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;

      let options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      if (status) {
        options.where = { status };
      }

      const users = await this.userService.listUsers(options);

      return res.status(200).json({
        success: true,
        data: users.data,
        pagination: users.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Search users
   */
  async searchUsers(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const users = await this.userService.searchUsers(q, {
        page: parseInt(page),
        limit: parseInt(limit),
      });

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(req, res) {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        return res.status(400).json({
          success: false,
          message: "Role ID is required",
        });
      }

      const result = await this.userService.assignRoleToUser(
        userId,
        roleId,
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
   * Remove role from user
   */
  async removeRoleFromUser(req, res) {
    try {
      const { userId, roleId } = req.params;

      const result = await this.userService.removeRoleFromUser(
        userId,
        roleId,
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
   * Assign branch to user
   */
  async assignBranchToUser(req, res) {
    try {
      const { userId } = req.params;
      const { branchId, accessLevel = "full" } = req.body;

      if (!branchId) {
        return res.status(400).json({
          success: false,
          message: "Branch ID is required",
        });
      }

      const result = await this.userService.assignBranchToUser(
        userId,
        branchId,
        accessLevel,
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
   * Remove branch from user
   */
  async removeBranchFromUser(req, res) {
    try {
      const { userId, branchId } = req.params;

      const result = await this.userService.removeBranchFromUser(
        userId,
        branchId,
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
   * Assign permission to user
   */
  async assignPermissionToUser(req, res) {
    try {
      const { userId } = req.params;
      const { permissionId, grantType = "grant" } = req.body;

      if (!permissionId) {
        return res.status(400).json({
          success: false,
          message: "Permission ID is required",
        });
      }

      const result = await this.userService.assignPermissionToUser(
        userId,
        permissionId,
        grantType,
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
   * Remove permission from user
   */
  async removePermissionFromUser(req, res) {
    try {
      const { userId, permissionId } = req.params;

      const result = await this.userService.removePermissionFromUser(
        userId,
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
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { userId } = req.params;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All password fields are required",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }

      const result = await this.userService.changePassword(
        userId,
        oldPassword,
        newPassword,
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
   * Reset password (admin)
   */
  async resetPassword(req, res) {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      const result = await this.userService.resetPassword(
        userId,
        newPassword,
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
   * Suspend user
   */
  async suspendUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const result = await this.userService.suspendUser(
        userId,
        reason,
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
   * Activate user
   */
  async activateUser(req, res) {
    try {
      const { userId } = req.params;

      const result = await this.userService.activateUser(userId, req.user?.id);

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
}

module.exports = UserController;
