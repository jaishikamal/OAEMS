const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const AuditLogRepository = require("../repositories/AuditLogRepository");
const LoginAttemptRepository = require("../repositories/LoginAttemptRepository");

class UserService {
  constructor(models) {
    this.models = models;
    this.userRepository = new UserRepository(models.User);
    this.auditLogRepository = new AuditLogRepository(models.AuditLog);
    this.loginAttemptRepository = new LoginAttemptRepository(
      models.LoginAttempt,
    );
  }

  /**
   * Create a new user
   */
  async createUser(userData, createdBy) {
    try {
      const { email, username, password, firstName, lastName } = userData;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const existingUsername = await this.userRepository.findByUsername(
        username,
      );
      if (existingUsername) {
        throw new Error("Username already taken");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
        createdBy,
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: createdBy,
        module: "UserManagement",
        action: "CREATE",
        entityType: "User",
        entityId: newUser.id,
        newValues: {
          firstName,
          lastName,
          email,
          username,
          status: "active",
        },
        status: "success",
        description: `User ${email} created`,
      });

      return this.sanitizeUser(newUser);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Get user by ID with all relations
   */
  async getUserById(userId) {
    try {
      const user = await this.userRepository.findUserWithRelations(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      throw new Error(`Error getting user: ${error.message}`);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData, updatedBy) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const oldValues = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
      };

      // Update user
      const updatedUser = await this.userRepository.update(userId, updateData);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: updatedBy,
        module: "UserManagement",
        action: "UPDATE",
        entityType: "User",
        entityId: userId,
        oldValues,
        newValues: updateData,
        status: "success",
        description: `User ${user.email} updated`,
      });

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId, deletedBy) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Soft delete
      await this.userRepository.update(userId, {
        status: "inactive",
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: deletedBy,
        module: "UserManagement",
        action: "DELETE",
        entityType: "User",
        entityId: userId,
        oldValues: {
          status: user.status,
        },
        newValues: {
          status: "inactive",
        },
        status: "success",
        description: `User ${user.email} deleted`,
      });

      return { message: "User deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * List all users with pagination
   */
  async listUsers(options = {}) {
    try {
      return await this.userRepository.paginate({
        ...options,
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"],
        },
      });
    } catch (error) {
      throw new Error(`Error listing users: ${error.message}`);
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm, options = {}) {
    try {
      const users = await this.userRepository.searchUsers(searchTerm, {
        ...options,
        attributes: {
          exclude: ["password"],
        },
      });
      return users;
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId, roleId, assignedBy) {
    try {
      await this.userRepository.assignRole(userId, roleId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: assignedBy,
        module: "UserManagement",
        action: "ASSIGN_ROLE",
        entityType: "UserRole",
        entityId: `${userId}-${roleId}`,
        newValues: { userId, roleId },
        status: "success",
        description: `Role ${roleId} assigned to user ${userId}`,
      });

      return { message: "Role assigned successfully" };
    } catch (error) {
      throw new Error(`Error assigning role: ${error.message}`);
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId, roleId, removedBy) {
    try {
      await this.userRepository.removeRole(userId, roleId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: removedBy,
        module: "UserManagement",
        action: "REMOVE_ROLE",
        entityType: "UserRole",
        entityId: `${userId}-${roleId}`,
        oldValues: { userId, roleId },
        status: "success",
        description: `Role ${roleId} removed from user ${userId}`,
      });

      return { message: "Role removed successfully" };
    } catch (error) {
      throw new Error(`Error removing role: ${error.message}`);
    }
  }

  /**
   * Assign branch to user
   */
  async assignBranchToUser(
    userId,
    branchId,
    accessLevel = "full",
    assignedBy,
  ) {
    try {
      await this.userRepository.assignBranch(userId, branchId, accessLevel);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: assignedBy,
        module: "UserManagement",
        action: "ASSIGN_BRANCH",
        entityType: "UserBranch",
        entityId: `${userId}-${branchId}`,
        newValues: { userId, branchId, accessLevel },
        status: "success",
        description: `Branch ${branchId} assigned to user ${userId}`,
      });

      return { message: "Branch assigned successfully" };
    } catch (error) {
      throw new Error(`Error assigning branch: ${error.message}`);
    }
  }

  /**
   * Remove branch from user
   */
  async removeBranchFromUser(userId, branchId, removedBy) {
    try {
      await this.userRepository.removeBranch(userId, branchId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: removedBy,
        module: "UserManagement",
        action: "REMOVE_BRANCH",
        entityType: "UserBranch",
        entityId: `${userId}-${branchId}`,
        oldValues: { userId, branchId },
        status: "success",
        description: `Branch ${branchId} removed from user ${userId}`,
      });

      return { message: "Branch removed successfully" };
    } catch (error) {
      throw new Error(`Error removing branch: ${error.message}`);
    }
  }

  /**
   * Assign permission to user
   */
  async assignPermissionToUser(
    userId,
    permissionId,
    grantType = "grant",
    assignedBy,
  ) {
    try {
      await this.userRepository.assignPermission(userId, permissionId, grantType);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: assignedBy,
        module: "UserManagement",
        action: "ASSIGN_PERMISSION",
        entityType: "UserPermission",
        entityId: `${userId}-${permissionId}`,
        newValues: { userId, permissionId, grantType },
        status: "success",
        description: `Permission ${permissionId} assigned to user ${userId}`,
      });

      return { message: "Permission assigned successfully" };
    } catch (error) {
      throw new Error(`Error assigning permission: ${error.message}`);
    }
  }

  /**
   * Remove permission from user
   */
  async removePermissionFromUser(userId, permissionId, removedBy) {
    try {
      await this.userRepository.removePermission(userId, permissionId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: removedBy,
        module: "UserManagement",
        action: "REMOVE_PERMISSION",
        entityType: "UserPermission",
        entityId: `${userId}-${permissionId}`,
        oldValues: { userId, permissionId },
        status: "success",
        description: `Permission ${permissionId} removed from user ${userId}`,
      });

      return { message: "Permission removed successfully" };
    } catch (error) {
      throw new Error(`Error removing permission: ${error.message}`);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword, changedBy) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify old password
      const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordCorrect) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepository.updatePassword(userId, hashedPassword);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: changedBy,
        module: "UserManagement",
        action: "CHANGE_PASSWORD",
        entityType: "User",
        entityId: userId,
        status: "success",
        description: `Password changed for user ${user.email}`,
      });

      return { message: "Password changed successfully" };
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }

  /**
   * Reset password (admin)
   */
  async resetPassword(userId, newPassword, resetBy) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await this.userRepository.updatePassword(userId, hashedPassword);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: resetBy,
        module: "UserManagement",
        action: "RESET_PASSWORD",
        entityType: "User",
        entityId: userId,
        status: "success",
        description: `Password reset for user ${user.email}`,
      });

      return { message: "Password reset successfully" };
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }

  /**
   * Suspend user
   */
  async suspendUser(userId, suspension_reason, suspendedBy) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await this.userRepository.update(userId, {
        status: "suspended",
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: suspendedBy,
        module: "UserManagement",
        action: "SUSPEND_USER",
        entityType: "User",
        entityId: userId,
        oldValues: { status: user.status },
        newValues: { status: "suspended" },
        description: `User ${user.email} suspended. Reason: ${suspension_reason}`,
        status: "success",
      });

      return { message: "User suspended successfully" };
    } catch (error) {
      throw new Error(`Error suspending user: ${error.message}`);
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId, activatedBy) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      await this.userRepository.update(userId, {
        status: "active",
        isLocked: false,
        lockUntil: null,
        failedLoginAttempts: 0,
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: activatedBy,
        module: "UserManagement",
        action: "ACTIVATE_USER",
        entityType: "User",
        entityId: userId,
        oldValues: { status: user.status },
        newValues: { status: "active" },
        status: "success",
        description: `User ${user.email} activated`,
      });

      return { message: "User activated successfully" };
    } catch (error) {
      throw new Error(`Error activating user: ${error.message}`);
    }
  }

  /**
   * Utility to sanitize user data
   */
  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user.dataValues || user;
    return userWithoutPassword;
  }
}

module.exports = UserService;
