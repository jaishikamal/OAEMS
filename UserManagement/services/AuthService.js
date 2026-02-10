const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/UserRepository");
const LoginAttemptRepository = require("../repositories/LoginAttemptRepository");
const AuditLogRepository = require("../repositories/AuditLogRepository");

class AuthService {
  constructor(models) {
    this.models = models;
    this.userRepository = new UserRepository(models.User);
    this.loginAttemptRepository = new LoginAttemptRepository(
      models.LoginAttempt,
    );
    this.auditLogRepository = new AuditLogRepository(models.AuditLog);
  }

  /**
   * Login user
   */
  async login(emailOrUsername, password, ipAddress, userAgent) {
    try {
      const user = await this.userRepository.findByEmailOrUsername(
        emailOrUsername,
        {
          include: [
            { association: "roles", attributes: ["id", "code", "name"] },
            {
              association: "branches",
              attributes: ["id", "code", "name"],
              through: { attributes: ["accessLevel"] },
            },
          ],
        },
      );

      if (!user) {
        // Log failed attempt
        await this.loginAttemptRepository.logLoginAttempt(
          null,
          emailOrUsername,
          false,
          "User not found",
          ipAddress,
          userAgent,
        );
        throw new Error("Invalid credentials");
      }

      // Check if user is locked
      if (user.isLocked && user.lockUntil > new Date()) {
        await this.loginAttemptRepository.logLoginAttempt(
          user.id,
          user.email,
          false,
          "User account locked",
          ipAddress,
          userAgent,
        );
        throw new Error("User account is locked. Please try again later.");
      }

      // Check if user is active
      if (user.status !== "active") {
        await this.loginAttemptRepository.logLoginAttempt(
          user.id,
          user.email,
          false,
          `User status: ${user.status}`,
          ipAddress,
          userAgent,
        );
        throw new Error("User account is not active");
      }

      // Verify password
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password,
      );
      if (!isPasswordCorrect) {
        // Increment failed attempts
        const failedAttemptCount = await this.incrementFailedLoginAttempts(user.id);

        // Lock account after 5 failed attempts
        if (failedAttemptCount >= 5) {
          const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
          await this.userRepository.lockUser(user.id, lockUntil);
        }

        // Log failed attempt
        await this.loginAttemptRepository.logLoginAttempt(
          user.id,
          user.email,
          false,
          "Invalid password",
          ipAddress,
          userAgent,
        );
        throw new Error("Invalid credentials");
      }

      // Reset failed attempts and unlock if locked
      await this.userRepository.resetFailedAttempts(user.id);
      if (user.isLocked) {
        await this.userRepository.unlockUser(user.id);
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(
        user.id,
        ipAddress,
        userAgent,
      );

      // Log successful login
      await this.loginAttemptRepository.logLoginAttempt(
        user.id,
        user.email,
        true,
        "Login successful",
        ipAddress,
        userAgent,
      );

      // Log audit
      await this.auditLogRepository.logAction({
        userId: user.id,
        module: "Auth",
        action: "LOGIN",
        entityType: "User",
        entityId: user.id,
        ipAddress,
        status: "success",
        description: `User ${user.email} logged in`,
      });

      return {
        accessToken,
        refreshToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new Error(`Login error: ${error.message}`);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken, ipAddress, userAgent) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
      );

      // Check if token is revoked
      const storedToken = await this.models.RefreshToken.findOne({
        where: {
          token: refreshToken,
          isRevoked: false,
          expiresAt: {
            [require("sequelize").Op.gt]: new Date(),
          },
        },
      });

      if (!storedToken) {
        throw new Error("Invalid or expired refresh token");
      }

      // Get user
      const user = await this.userRepository.findById(decoded.userId, {
        include: [
          { association: "roles", attributes: ["id", "code", "name"] },
          {
            association: "branches",
            attributes: ["id", "code", "name"],
            through: { attributes: ["accessLevel"] },
          },
        ],
      });

      if (!user || user.status !== "active") {
        throw new Error("User not found or inactive");
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        accessToken: newAccessToken,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new Error(`Token refresh error: ${error.message}`);
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken, logoutBy) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
      );

      // Revoke refresh token
      await this.models.RefreshToken.update(
        {
          isRevoked: true,
          revokedAt: new Date(),
          revokedBy: decoded.userId,
        },
        {
          where: { token: refreshToken },
        },
      );

      // Log audit
      await this.auditLogRepository.logAction({
        userId: decoded.userId,
        module: "Auth",
        action: "LOGOUT",
        entityType: "User",
        entityId: decoded.userId,
        status: "success",
        description: "User logged out",
      });

      return { message: "Logged out successfully" };
    } catch (error) {
      throw new Error(`Logout error: ${error.message}`);
    }
  }

  /**
   * Generate access token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      roles: user.roles ? user.roles.map((r) => r.code) : [],
      branches: user.branches
        ? user.branches.map((b) => ({
            id: b.id,
            code: b.code,
            accessLevel: b.UserBranch.accessLevel,
          }))
        : [],
      defaultBranchId: user.defaultBranchId,
    };

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET || "access-secret", {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    });
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(userId, ipAddress, userAgent) {
    try {
      const payload = { userId };
      const token = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
        {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
        },
      );

      const expiresAt = new Date(
        Date.now() +
          (process.env.REFRESH_TOKEN_EXPIRY_DAYS || 7) * 24 * 60 * 60 * 1000,
      );

      // Store refresh token
      await this.models.RefreshToken.create({
        userId,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      });

      return token;
    } catch (error) {
      throw new Error(`Error generating refresh token: ${error.message}`);
    }
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(userId) {
    try {
      await this.userRepository.incrementFailedAttempts(userId);
      const user = await this.userRepository.findById(userId);
      return user.failedLoginAttempts;
    } catch (error) {
      throw new Error(`Error incrementing failed attempts: ${error.message}`);
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

module.exports = AuthService;
