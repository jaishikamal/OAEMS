const BranchService = require("../services/BranchService");

class BranchController {
  constructor(models) {
    this.models = models;
    this.branchService = new BranchService(models);
  }

  /**
   * Create branch
   */
  async createBranch(req, res) {
    try {
      const { code, name, level, description } = req.body;

      if (!code || !name) {
        return res.status(400).json({
          success: false,
          message: "Code and name are required",
        });
      }

      const branch = await this.branchService.createBranch(
        { ...req.body },
        req.user?.id,
      );

      return res.status(201).json({
        success: true,
        message: "Branch created successfully",
        data: branch,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get branch by ID
   */
  async getBranchById(req, res) {
    try {
      const { branchId } = req.params;

      const branch = await this.branchService.getBranchById(branchId);

      return res.status(200).json({
        success: true,
        data: branch,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update branch
   */
  async updateBranch(req, res) {
    try {
      const { branchId } = req.params;

      const branch = await this.branchService.updateBranch(
        branchId,
        req.body,
        req.user?.id,
      );

      return res.status(200).json({
        success: true,
        message: "Branch updated successfully",
        data: branch,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(req, res) {
    try {
      const { branchId } = req.params;

      const result = await this.branchService.deleteBranch(
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
   * List branches
   */
  async listBranches(req, res) {
    try {
      const { page = 1, limit = 10, level } = req.query;

      let options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      if (level) {
        options.where = { level };
      }

      const branches = await this.branchService.listBranches(options);

      return res.status(200).json({
        success: true,
        data: branches.data,
        pagination: branches.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get branches by level
   */
  async getBranchesByLevel(req, res) {
    try {
      const { level } = req.params;

      const branches = await this.branchService.getBranchesByLevel(level);

      return res.status(200).json({
        success: true,
        data: branches,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get child branches
   */
  async getChildBranches(req, res) {
    try {
      const { parentBranchId } = req.params;

      const branches = await this.branchService.getChildBranches(
        parentBranchId,
      );

      return res.status(200).json({
        success: true,
        data: branches,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Add user to branch
   */
  async addUserToBranch(req, res) {
    try {
      const { branchId } = req.params;
      const { userId, accessLevel = "full" } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      const result = await this.branchService.addUserToBranch(
        branchId,
        userId,
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
   * Remove user from branch
   */
  async removeUserFromBranch(req, res) {
    try {
      const { branchId, userId } = req.params;

      const result = await this.branchService.removeUserFromBranch(
        branchId,
        userId,
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
   * Search branches
   */
  async searchBranches(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const branches = await this.branchService.searchBranches(q);

      return res.status(200).json({
        success: true,
        data: branches,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get active branches
   */
  async getActiveBranches(req, res) {
    try {
      const branches = await this.branchService.getActiveBranches();

      return res.status(200).json({
        success: true,
        data: branches,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = BranchController;
