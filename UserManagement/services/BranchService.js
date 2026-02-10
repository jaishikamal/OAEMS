const BranchRepository = require("../repositories/BranchRepository");
const AuditLogRepository = require("../repositories/AuditLogRepository");

class BranchService {
  constructor(models) {
    this.models = models;
    this.branchRepository = new BranchRepository(models.Branch);
    this.auditLogRepository = new AuditLogRepository(models.AuditLog);
  }

  /**
   * Create branch
   */
  async createBranch(branchData, createdBy) {
    try {
      const { code, name, level, description } = branchData;

      // Check if branch already exists
      const existingBranch = await this.branchRepository.findByCode(code);
      if (existingBranch) {
        throw new Error("Branch with this code already exists");
      }

      const newBranch = await this.branchRepository.create({
        ...branchData,
        status: "active",
        createdBy,
      });

      // Log audit
      await this.auditLogRepository.logAction({
        userId: createdBy,
        module: "BranchManagement",
        action: "CREATE",
        entityType: "Branch",
        entityId: newBranch.id,
        newValues: { code, name, level, description },
        status: "success",
        description: `Branch ${code} created`,
      });

      return newBranch;
    } catch (error) {
      throw new Error(`Error creating branch: ${error.message}`);
    }
  }

  /**
   * Get branch by ID with hierarchy
   */
  async getBranchById(branchId) {
    try {
      return await this.branchRepository.findBranchHierarchy(branchId);
    } catch (error) {
      throw new Error(`Error getting branch: ${error.message}`);
    }
  }

  /**
   * Update branch
   */
  async updateBranch(branchId, updateData, updatedBy) {
    try {
      const branch = await this.branchRepository.findById(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }

      const oldValues = {
        name: branch.name,
        level: branch.level,
        location: branch.location,
        status: branch.status,
      };

      const updatedBranch = await this.branchRepository.update(
        branchId,
        updateData,
      );

      // Log audit
      await this.auditLogRepository.logAction({
        userId: updatedBy,
        module: "BranchManagement",
        action: "UPDATE",
        entityType: "Branch",
        entityId: branchId,
        oldValues,
        newValues: updateData,
        status: "success",
        description: `Branch ${branch.code} updated`,
      });

      return updatedBranch;
    } catch (error) {
      throw new Error(`Error updating branch: ${error.message}`);
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(branchId, deletedBy) {
    try {
      const branch = await this.branchRepository.findById(branchId);
      if (!branch) {
        throw new Error("Branch not found");
      }

      // Check for child branches
      const childBranches = await this.branchRepository.findChildBranches(
        branchId,
      );
      if (childBranches.length > 0) {
        throw new Error("Cannot delete branch with child branches");
      }

      await this.branchRepository.delete(branchId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: deletedBy,
        module: "BranchManagement",
        action: "DELETE",
        entityType: "Branch",
        entityId: branchId,
        oldValues: {
          code: branch.code,
          name: branch.name,
        },
        status: "success",
        description: `Branch ${branch.code} deleted`,
      });

      return { message: "Branch deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting branch: ${error.message}`);
    }
  }

  /**
   * List branches
   */
  async listBranches(options = {}) {
    try {
      return await this.branchRepository.paginate({
        ...options,
        order: [["level", "ASC"]],
      });
    } catch (error) {
      throw new Error(`Error listing branches: ${error.message}`);
    }
  }

  /**
   * Get branches by level
   */
  async getBranchesByLevel(level, options = {}) {
    try {
      return await this.branchRepository.findByLevel(level, options);
    } catch (error) {
      throw new Error(`Error getting branches by level: ${error.message}`);
    }
  }

  /**
   * Get branch hierarchy
   */
  async getBranchHierarchy(branchId) {
    try {
      return await this.branchRepository.findBranchHierarchy(branchId);
    } catch (error) {
      throw new Error(`Error getting branch hierarchy: ${error.message}`);
    }
  }

  /**
   * Get child branches
   */
  async getChildBranches(parentBranchId) {
    try {
      return await this.branchRepository.findChildBranches(parentBranchId);
    } catch (error) {
      throw new Error(`Error getting child branches: ${error.message}`);
    }
  }

  /**
   * Add user to branch
   */
  async addUserToBranch(branchId, userId, accessLevel = "full", addedBy) {
    try {
      await this.branchRepository.addUserToBranch(
        branchId,
        userId,
        accessLevel,
      );

      // Log audit
      await this.auditLogRepository.logAction({
        userId: addedBy,
        module: "BranchManagement",
        action: "ADD_USER",
        entityType: "UserBranch",
        entityId: `${branchId}-${userId}`,
        newValues: { branchId, userId, accessLevel },
        status: "success",
        description: `User ${userId} added to branch ${branchId}`,
      });

      return { message: "User added to branch successfully" };
    } catch (error) {
      throw new Error(`Error adding user to branch: ${error.message}`);
    }
  }

  /**
   * Remove user from branch
   */
  async removeUserFromBranch(branchId, userId, removedBy) {
    try {
      await this.branchRepository.removeUserFromBranch(branchId, userId);

      // Log audit
      await this.auditLogRepository.logAction({
        userId: removedBy,
        module: "BranchManagement",
        action: "REMOVE_USER",
        entityType: "UserBranch",
        entityId: `${branchId}-${userId}`,
        oldValues: { branchId, userId },
        status: "success",
        description: `User ${userId} removed from branch ${branchId}`,
      });

      return { message: "User removed from branch successfully" };
    } catch (error) {
      throw new Error(`Error removing user from branch: ${error.message}`);
    }
  }

  /**
   * Search branches
   */
  async searchBranches(searchTerm, options = {}) {
    try {
      return await this.branchRepository.searchBranches(searchTerm, options);
    } catch (error) {
      throw new Error(`Error searching branches: ${error.message}`);
    }
  }

  /**
   * Get active branches
   */
  async getActiveBranches(options = {}) {
    try {
      return await this.branchRepository.findActiveBranches(options);
    } catch (error) {
      throw new Error(`Error getting active branches: ${error.message}`);
    }
  }
}

module.exports = BranchService;
