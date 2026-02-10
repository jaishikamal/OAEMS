const BaseRepository = require("./BaseRepository");
const { Op } = require("sequelize");

class UserRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async findByEmail(email, options = {}) {
    try {
      return await this.findOne({ email }, options);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findByUsername(username, options = {}) {
    try {
      return await this.findOne({ username }, options);
    } catch (error) {
      throw new Error(`Error finding user by username: ${error.message}`);
    }
  }

  async findByEmailOrUsername(emailOrUsername, options = {}) {
    try {
      return await this.findOne(
        {
          [Op.or]: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
        options,
      );
    } catch (error) {
      throw new Error(
        `Error finding user by email or username: ${error.message}`,
      );
    }
  }

  async findActiveUsers(options = {}) {
    try {
      return await this.findAll({
        where: { status: "active" },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding active users: ${error.message}`);
    }
  }

  async findUserWithRelations(userId, options = {}) {
    try {
      return await this.findById(userId, {
        include: [
          { association: "roles", attributes: ["id", "code", "name"] },
          {
            association: "branches",
            attributes: ["id", "code", "name"],
            through: { attributes: ["accessLevel"] },
          },
          {
            association: "permissions",
            attributes: ["id", "code", "name"],
            through: { attributes: ["grantType"] },
          },
          { association: "defaultBranch", attributes: ["id", "code", "name"] },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(
        `Error finding user with relations: ${error.message}`,
      );
    }
  }

  async findUsersByRole(roleId, options = {}) {
    try {
      const db = require("../models");
      return await this.findAll({
        include: [
          {
            association: "roles",
            where: { id: roleId },
            attributes: [],
            through: { attributes: [] },
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding users by role: ${error.message}`);
    }
  }

  async findUsersByBranch(branchId, options = {}) {
    try {
      return await this.findAll({
        include: [
          {
            association: "branches",
            where: { id: branchId },
            attributes: [],
            through: { attributes: [] },
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding users by branch: ${error.message}`);
    }
  }

  async lockUser(userId, lockUntil) {
    try {
      return await this.update(userId, {
        isLocked: true,
        lockUntil,
      });
    } catch (error) {
      throw new Error(`Error locking user: ${error.message}`);
    }
  }

  async unlockUser(userId) {
    try {
      return await this.update(userId, {
        isLocked: false,
        lockUntil: null,
        failedLoginAttempts: 0,
      });
    } catch (error) {
      throw new Error(`Error unlocking user: ${error.message}`);
    }
  }

  async incrementFailedAttempts(userId) {
    try {
      const user = await this.findById(userId);
      return await user.update({
        failedLoginAttempts: user.failedLoginAttempts + 1,
      });
    } catch (error) {
      throw new Error(`Error incrementing failed attempts: ${error.message}`);
    }
  }

  async resetFailedAttempts(userId) {
    try {
      return await this.update(userId, {
        failedLoginAttempts: 0,
      });
    } catch (error) {
      throw new Error(`Error resetting failed attempts: ${error.message}`);
    }
  }

  async updateLastLogin(userId) {
    try {
      return await this.update(userId, {
        lastLogin: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  async assignRole(userId, roleId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return await user.addRole(roleId);
    } catch (error) {
      throw new Error(`Error assigning role: ${error.message}`);
    }
  }

  async removeRole(userId, roleId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return await user.removeRole(roleId);
    } catch (error) {
      throw new Error(`Error removing role: ${error.message}`);
    }
  }

  async assignBranch(userId, branchId, accessLevel = "full") {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return await user.addBranch(branchId, {
        through: { accessLevel },
      });
    } catch (error) {
      throw new Error(`Error assigning branch: ${error.message}`);
    }
  }

  async removeBranch(userId, branchId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return await user.removeBranch(branchId);
    } catch (error) {
      throw new Error(`Error removing branch: ${error.message}`);
    }
    }

  async assignPermission(userId, permissionId, grantType = "grant") {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return await user.addPermission(permissionId, {
        through: { grantType },
      });
    } catch (error) {
      throw new Error(`Error assigning permission: ${error.message}`);
    }
  }

  async removePermission(userId, permissionId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      return await user.removePermission(permissionId);
    } catch (error) {
      throw new Error(`Error removing permission: ${error.message}`);
    }
  }

  async updatePassword(userId, newPassword) {
    try {
      return await this.update(userId, {
        password: newPassword,
        passwordChangedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  async searchUsers(searchTerm, options = {}) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${searchTerm}%` } },
            { lastName: { [Op.iLike]: `%${searchTerm}%` } },
            { email: { [Op.iLike]: `%${searchTerm}%` } },
            { username: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }
  }
}

module.exports = UserRepository;
