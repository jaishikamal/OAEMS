const BaseRepository = require("./BaseRepository");
const { Op } = require("sequelize");

class PermissionRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async findByCode(code, options = {}) {
    try {
      return await this.findOne({ code }, options);
    } catch (error) {
      throw new Error(`Error finding permission by code: ${error.message}`);
    }
  }

  async findByModule(module, options = {}) {
    try {
      return await this.findAll({
        where: { module },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding permissions by module: ${error.message}`);
    }
  }

  async findByResource(resource, options = {}) {
    try {
      return await this.findAll({
        where: { resource },
        ...options,
      });
    } catch (error) {
      throw new Error(
        `Error finding permissions by resource: ${error.message}`,
      );
    }
  }

  async findByAction(action, options = {}) {
    try {
      return await this.findAll({
        where: { action },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding permissions by action: ${error.message}`);
    }
  }

  async findActivePermissions(options = {}) {
    try {
      return await this.findAll({
        where: { status: "active" },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding active permissions: ${error.message}`);
    }
  }

  async findPermissionsByModuleAndResource(module, resource, options = {}) {
    try {
      return await this.findAll({
        where: { module, resource },
        ...options,
      });
    } catch (error) {
      throw new Error(
        `Error finding permissions by module and resource: ${error.message}`,
      );
    }
  }

  async findPermissionsByModuleResourceAction(
    module,
    resource,
    action,
    options = {},
  ) {
    try {
      return await this.findOne(
        { module, resource, action },
        options,
      );
    } catch (error) {
      throw new Error(
        `Error finding permission: ${error.message}`,
      );
    }
  }

  async findRolePermissions(roleId, options = {}) {
    try {
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
      throw new Error(`Error finding role permissions: ${error.message}`);
    }
  }

  async findUserPermissions(userId, options = {}) {
    try {
      return await this.findAll({
        include: [
          {
            association: "users",
            where: { id: userId },
            attributes: [],
            through: { attributes: ["grantType"] },
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding user permissions: ${error.message}`);
    }
  }

  async searchPermissions(searchTerm, options = {}) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { code: { [Op.iLike]: `%${searchTerm}%` } },
            { description: { [Op.iLike]: `%${searchTerm}%` } },
            { module: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error searching permissions: ${error.message}`);
    }
  }

  async groupByModule(options = {}) {
    try {
      return await this.findAll({
        attributes: {
          include: ["module"],
        },
        group: ["module"],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error grouping permissions by module: ${error.message}`);
    }
  }

  async getSystemPermissions(options = {}) {
    try {
      return await this.findAll({
        where: { isSystem: true },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error getting system permissions: ${error.message}`);
    }
  }
}

module.exports = PermissionRepository;
