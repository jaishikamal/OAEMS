const AuthService = require("../services/AuthService");

class AuthController {
  constructor(models) {
    this.models = models;
    this.authService = new AuthService(models);
  }

  /**
   * Login
   */
  async login(req, res) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername || !password) {
        return res.status(400).json({
          success: false,
          message: "Email/Username and password are required",
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.get("user-agent");

      const result = await this.authService.login(
        emailOrUsername,
        password,
        ipAddress,
        userAgent,
      );

      // Set refresh token in httpOnly cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const refreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      const ipAddress = req.ip;
      const userAgent = req.get("user-agent");

      const result = await this.authService.refreshAccessToken(
        refreshToken,
        ipAddress,
        userAgent,
      );

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Logout
   */
  async logout(req, res) {
    try {
      const refreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await this.authService.logout(refreshToken, req.user?.id);
      }

      res.clearCookie("refreshToken");

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const UserRepository = require("../repositories/UserRepository");
      const userRepository = new UserRepository(this.models.User);
      const user = await userRepository.findUserWithRelations(req.user.id);

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = AuthController;
