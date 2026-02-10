const BaseRepository = require("./BaseRepository");const BaseRepository = require("./BaseRepository");







































































































































module.exports = LoginAttemptRepository;}  }    }      throw new Error(`Error getting security insights: ${error.message}`);    } catch (error) {      };        lastFailedLogin: failedAttempts[0] || null,        lastSuccessfulLogin: successfulAttempts[0] || null,        successfulCount: successfulAttempts.length,        failedCount: failedAttempts.length,        recentAttempts: recentAttempts.data.slice(0, 10),        totalAttempts: recentAttempts.pagination.total,      return {      );        (a) => a.isSuccessful,      const successfulAttempts = recentAttempts.data.filter(      );        (a) => !a.isSuccessful,      const failedAttempts = recentAttempts.data.filter(      });        limit: 100,      const recentAttempts = await this.getUserLoginHistory(userId, {    try {  async getSecurityInsights(userId, options = {}) {  }    }      throw new Error(`Error getting logins by email: ${error.message}`);    } catch (error) {      });        ...options,        order: [["createdAt", "DESC"]],        where: { email },      return await this.paginate({    try {  async getLoginsByEmail(email, options = {}) {  }    }      throw new Error(`Error getting failed logins: ${error.message}`);    } catch (error) {      });        ...options,        order: [["createdAt", "DESC"]],        where: { userId, isSuccessful: false },      return await this.paginate({    try {  async getFailedLogins(userId, options = {}) {  }    }      throw new Error(`Error getting successful logins: ${error.message}`);    } catch (error) {      });        ...options,        order: [["createdAt", "DESC"]],        where: { userId, isSuccessful: true },      return await this.paginate({    try {  async getSuccessfulLogins(userId, options = {}) {  }    }      throw new Error(`Error getting user login history: ${error.message}`);    } catch (error) {      });        ...options,        limit: options.limit || 50,        order: [["createdAt", "DESC"]],        where: { userId },      return await this.paginate({    try {  async getUserLoginHistory(userId, options = {}) {  }    }      );        `Error getting failed attempt count: ${error.message}`,      throw new Error(    } catch (error) {      return attempts.length;      );        minutesBack,        userId,      const attempts = await this.getRecentFailedAttempts(    try {  async getFailedAttemptCount(userId, minutesBack = 30) {  }    }      );        `Error getting recent failed attempts: ${error.message}`,      throw new Error(    } catch (error) {      });        order: [["createdAt", "DESC"]],        },          },            [Op.gte]: timeAgo,          createdAt: {          isSuccessful: false,          userId,        where: {      return await this.findAll({      const timeAgo = new Date(Date.now() - minutesBack * 60 * 1000);      const { Op } = require("sequelize");    try {  async getRecentFailedAttempts(userId, minutesBack = 30) {  }    }      throw new Error(`Error logging login attempt: ${error.message}`);    } catch (error) {      });        userAgent,        ipAddress,        reason,        isSuccessful,        email,        userId,      return await this.create({    try {  async logLoginAttempt(userId, email, isSuccessful, reason, ipAddress, userAgent) {  }    this.model = model;    super(model);  constructor(model) {class LoginAttemptRepository extends BaseRepository {
class AuditLogRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async logAction(auditData) {
    try {
      return await this.create(auditData);
    } catch (error) {
      throw new Error(`Error logging action: ${error.message}`);
    }
  }

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

  async findAuditsByDateRange(startDate, endDate, options = {}) {
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

  async getAuditSummary(options = {}) {
    try {
      const { Op } = require("sequelize");
      const summary = await this.model.sequelize.query(
        `
        SELECT 
          module,
          action,
          status,
          COUNT(*) as count
        FROM audit_logs
        GROUP BY module, action, status
        ORDER BY module, action
      `,
        { type: "SELECT" },
      );
      return summary;
    } catch (error) {
      throw new Error(`Error getting audit summary: ${error.message}`);
    }
  }
}

module.exports = AuditLogRepository;
