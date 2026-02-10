const BaseRepository = require("./BaseRepository");
const { Op } = require("sequelize");

class RoleRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async findByCode(code, options = {}) {
    try {
      return await this.findOne({ code }, options);
    } catch (error) {
      throw new Error(`Error finding role by code: ${error.message}`);
    }
  }

  async findActiveRoles(options = {}) {
    try {
      return await this.findAll({
        where: { status: "active" },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding active roles: ${error.message}`);
    }
  }

  async findRoleWithPermissions(roleId, options = {}) {
    try {
      return await this.findById(roleId, {
        include: [
          {
            association: "permissions",
            attributes: ["id", "code", "name", "module", "resource", "action"],
            through: { attributes: [] },
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding role with permissions: ${error.message}`);
    }
  }

  async findRoleUsers(roleId, options = {}) {
    try {
      return await this.findById(roleId, {
        include: [
          {
            association: "users",
            attributes: ["id", "firstName", "lastName", "email", "status"],
            through: { attributes: [] },
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding role users: ${error.message}`);
    }
  }

  async assignPermission(roleId, permissionId) {
    try {
      const role = await this.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }
      return await role.addPermission(permissionId);
    } catch (error) {
      throw new Error(`Error assigning permission to role: ${error.message}`);
    }
  }

  async removePermission(roleId, permissionId) {
    try {
      const role = await this.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }
      return await role.removePermission(permissionId);
    } catch (error) {
      throw new Error(`Error removing permission from role: ${error.message}`);
    }
  }

  async assignPermissions(roleId, permissionIds) {
    try {
      const role = await this.findById(roleId);
      if (!role) {
        throw new Error("Role not found");
      }
      return await role.setPermissions(permissionIds);
    } catch (error) {
      throw new Error(
        `Error assigning permissions to role: ${error.message}`,
      );
    }
  }

  async searchRoles(searchTerm, options = {}) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { code: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error searching roles: ${error.message}`);
    }
  }

  async getSystemRoles(options = {}) {
    try {
      return await this.findAll({
        where: { isSystem: true },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error getting system roles: ${error.message}`);
    }
  }
}

module.exports = RoleRepository;
