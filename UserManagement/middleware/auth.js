const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 */
const authMiddleware = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "access-secret",
    );

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Role-Based Access Control Middleware
 */
const roleMiddleware = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = requiredRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

/**
 * Branch Access Filter Middleware
 */
const branchAccessMiddleware = (models) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const userBranches = req.user.branches || [];

      // If user is admin, allow access to all branches
      if (req.user.roles?.includes("ADMIN")) {
        req.accessibleBranches = null; // null means all branches
        return next();
      }

      // Otherwise, restrict to user's assigned branches
      req.accessibleBranches = userBranches.map((b) => b.id);
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

/**
 * Audit Logging Middleware
 */
const auditMiddleware = (models) => {
  return async (req, res, next) => {
    const AuditLogRepository =
      require("../repositories/AuditLogRepository");
    const auditLogRepository = new AuditLogRepository(models.AuditLog);

    // Store original send function
    const originalSend = res.json;

    res.json = function (data) {
      // Log the response
      if (req.user && req.method !== "GET") {
        auditLogRepository.logAction({
          userId: req.user.id,
          module: req.baseUrl?.split("/")[2] || "Unknown",
          action: req.method,
          entityType: req.original_path || req.path,
          entityId: req.params.userId || req.params.id || "N/A",
          newValues: req.body,
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
          status: data.success ? "success" : "failure",
          description: data.message,
        });
      }

      // Call original send
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Rate Limiting for Login
 */
const loginRateLimiter = (models) => {
  const attemptMap = new Map();
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!attemptMap.has(ip)) {
      attemptMap.set(ip, []);
    }

    const attempts = attemptMap.get(ip);
    const recentAttempts = attempts.filter(
      (time) => now - time < LOCK_TIME,
    );

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many login attempts. Please try again later.",
      });
    }

    recentAttempts.push(now);
    attemptMap.set(ip, recentAttempts);

    next();
  };
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  branchAccessMiddleware,
  auditMiddleware,
  loginRateLimiter,
};
