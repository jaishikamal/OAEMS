const BaseRepository = require("./BaseRepository");

/**
 * Audit Log Repository
 * Handles all audit log database operations
 */
class AuditLogRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  /**
   * Log an action
   */
  async logAction(auditData) {
    try {
      return await this.create(auditData);
    } catch (error) {
      throw new Error(`Error logging action: ${error.message}`);
    }
  }

  /**
   * Find audit logs by user
   */
  async findUserAuditLogs(userId, options = {}) {
    try {
      return await this.paginate({
        where: { userId },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding user audit logs: ${error.message}`);
    }
  }

  /**
   * Find audit logs by entity
   */
  async findEntityAuditLogs(entityType, entityId, options = {}) {
    try {
      return await this.paginate({
        where: { entityType, entityId },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding entity audit logs: ${error.message}`);
    }
  }

  /**
   * Find audit logs by module
   */
  async findModuleAuditLogs(module, options = {}) {
    try {
      return await this.paginate({
        where: { module },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding module audit logs: ${error.message}`);
    }
  }

  /**
   * Find audit logs by action
   */
  async findActionAuditLogs(action, options = {}) {
    try {
      return await this.paginate({
        where: { action },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding action audit logs: ${error.message}`);
    }
  }

  /**
   * Find audit logs by date range
   */
  async findAuditsByDateRange(startDate, endDate,options = {}) {
    try {
      const { Op } = require("sequelize");
      return await this.paginate({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error finding audits by date range: ${error.message}`);
    }
  }

  /**
   * Get audit summary
   */
  async getAuditSummary(options = {}) {
    try {
      const summary = await this.model.sequelize.query(
        `SELECT module, action, status, COUNT(*) as count
         FROM audit_logs
         GROUP BY module, action, status
         ORDER BY module, action`,
        { type: "SELECT" },
      );
      return summary;
    } catch (error) {
      throw new Error(`Error getting audit summary: ${error.message}`);
    }
  }
}

module.exports = AuditLogRepository;
