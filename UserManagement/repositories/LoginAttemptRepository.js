const BaseRepository = require("./BaseRepository");

class LoginAttemptRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.model = model;
  }

  async logLoginAttempt(userId, email, isSuccessful, reason, ipAddress, userAgent) {
    try {
      return await this.create({
        userId,
        email,
        isSuccessful,
        reason,
        ipAddress,
        userAgent,
      });
    } catch (error) {
      throw new Error(`Error logging login attempt: ${error.message}`);
    }
  }

  async getRecentFailedAttempts(userId, minutesBack = 30) {
    try {
      const { Op } = require("sequelize");
      const timeAgo = new Date(Date.now() - minutesBack * 60 * 1000);

      return await this.findAll({
        where: {
          userId,
          isSuccessful: false,
          createdAt: {
            [Op.gte]: timeAgo,
          },
        },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(
        `Error getting recent failed attempts: ${error.message}`,
      );
    }
  }

  async getFailedAttemptCount(userId, minutesBack = 30) {
    try {
      const attempts = await this.getRecentFailedAttempts(
        userId,
        minutesBack,
      );
      return attempts.length;
    } catch (error) {
      throw new Error(
        `Error getting failed attempt count: ${error.message}`,
      );
    }
  }

  async getUserLoginHistory(userId, options = {}) {
    try {
      return await this.paginate({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit: options.limit || 50,
        ...options,
      });
    } catch (error) {
      throw new Error(`Error getting user login history: ${error.message}`);
    }
  }

  async getSuccessfulLogins(userId, options = {}) {
    try {
      return await this.paginate({
        where: { userId, isSuccessful: true },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error getting successful logins: ${error.message}`);
    }
  }

  async getFailedLogins(userId, options = {}) {
    try {
      return await this.paginate({
        where: { userId, isSuccessful: false },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error getting failed logins: ${error.message}`);
    }
  }

  async getLoginsByEmail(email, options = {}) {
    try {
      return await this.paginate({
        where: { email },
        order: [["createdAt", "DESC"]],
        ...options,
      });
    } catch (error) {
      throw new Error(`Error getting logins by email: ${error.message}`);
    }
  }

  async getSecurityInsights(userId, options = {}) {
    try {
      const recentAttempts = await this.getUserLoginHistory(userId, {
        limit: 100,
      });
      const failedAttempts = recentAttempts.data.filter(
        (a) => !a.isSuccessful,
      );
      const successfulAttempts = recentAttempts.data.filter(
        (a) => a.isSuccessful,
      );

      return {
        totalAttempts: recentAttempts.pagination.total,
        recentAttempts: recentAttempts.data.slice(0, 10),
        failedCount: failedAttempts.length,
        successfulCount: successfulAttempts.length,
        lastSuccessfulLogin: successfulAttempts[0] || null,
        lastFailedLogin: failedAttempts[0] || null,
      };
    } catch (error) {
      throw new Error(`Error getting security insights: ${error.message}`);
    }
  }
}

module.exports = LoginAttemptRepository;
