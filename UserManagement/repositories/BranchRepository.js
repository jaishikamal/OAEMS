const BaseRepository = require("./BaseRepository");
const { Op } = require("sequelize");

class BranchRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async findByCode(code, options = {}) {
    try {
      return await this.findOne({ code }, options);
    } catch (error) {
      throw new Error(`Error finding branch by code: ${error.message}`);
    }
  }

  async findByLevel(level, options = {}) {
    try {
      return await this.findAll({
        where: { level },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding branches by level: ${error.message}`);
    }
  }

  async findActiveBranches(options = {}) {
    try {
      return await this.findAll({
        where: { status: "active" },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding active branches: ${error.message}`);
    }
  }

  async findBranchHierarchy(branchId, options = {}) {
    try {
      return await this.findById(branchId, {
        include: [
          {
            association: "parentBranch",
            attributes: ["id", "code", "name", "level"],
          },
          {
            association: "childBranches",
            attributes: ["id", "code", "name", "level"],
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(
        `Error finding branch hierarchy: ${error.message}`,
      );
    }
  }

  async findBranchWithUsers(branchId, options = {}) {
    try {
      return await this.findById(branchId, {
        include: [
          {
            association: "users",
            attributes: ["id", "firstName", "lastName", "email", "status"],
            through: { attributes: ["accessLevel"] },
          },
        ],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding branch with users: ${error.message}`);
    }
  }

  async findHeadOfficeBranches(options = {}) {
    try {
      return await this.findAll({
        where: { level: "head_office" },
        ...options,
      });
    } catch (error) {
      throw new Error(
        `Error finding head office branches: ${error.message}`,
      );
    }
  }

  async findChildBranches(parentBranchId, options = {}) {
    try {
      return await this.findAll({
        where: { parentBranchId },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding child branches: ${error.message}`);
    }
  }

  async findBranchesByCountry(country, options = {}) {
    try {
      return await this.findAll({
        where: { country },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding branches by country: ${error.message}`);
    }
  }

  async findBranchesByCity(city, options = {}) {
    try {
      return await this.findAll({
        where: { city },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding branches by city: ${error.message}`);
    }
  }

  async searchBranches(searchTerm, options = {}) {
    try {
      return await this.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { code: { [Op.iLike]: `%${searchTerm}%` } },
            { location: { [Op.iLike]: `%${searchTerm}%` } },
            { city: { [Op.iLike]: `%${searchTerm}%` } },
          ],
        },
        ...options,
      });
    } catch (error) {
      throw new Error(`Error searching branches: ${error.message}`);
    }
  }

  async addUserToBranch(branchId, userId, accessLevel = "full") {
    try {
      const branch = await this.findById(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }
      return await branch.addUser(userId, {
        through: { accessLevel },
      });
    } catch (error) {
      throw new Error(`Error adding user to branch: ${error.message}`);
    }
  }

  async removeUserFromBranch(branchId, userId) {
    try {
      const branch = await this.findById(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }
      return await branch.removeUser(userId);
    } catch (error) {
      throw new Error(`Error removing user from branch: ${error.message}`);
    }
  }
}

module.exports = BranchRepository;
