const jwt = require("jsonwebtoken");

/**
 * Auth Middleware - Verify JWT token from session
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.session?.token;

    if (!token) {
      console.warn(
        `Access attempt without token from IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: "No authentication token. Please login.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Attach user to request
    req.user = decoded;
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    // Clear invalid session
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
    });

    // Check if it's an API request or browser request
    if (req.accepts("json")) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    } else {
      return res.redirect("/auth/login");
    }
  }
};

/**
 * Role-Based Access Control Middleware
 * Usage: roleMiddleware(['admin', 'manager'])
 */
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRoles = req.user?.roles || req.session?.user?.roles || [];

      // Check if user has at least one of the allowed roles
      const hasRole = userRoles.some((role) => {
        if (typeof role === "string") {
          return allowedRoles.includes(role);
        }
        return allowedRoles.includes(role.code);
      });

      if (!hasRole) {
        console.warn(
          `Unauthorized access attempt - User roles: ${userRoles}, Required: ${allowedRoles}`
        );

        if (req.accepts("json")) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource.",
          });
        } else {
          return res.status(403).render("error", {
            title: "Access Denied",
            error: "403 - Forbidden",
            message: "You do not have permission to access this page.",
          });
        }
      }

      next();
    } catch (error) {
      console.error("Role check error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
      });
    }
  };
};

/**
 * Optional Auth Middleware - Allow request to proceed but attach user if authenticated
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.session?.token;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      req.user = decoded;
      req.userId = decoded.id;
    }

    next();
  } catch (error) {
    // Silently continue without user
    next();
  }
};

/**
 * Guest Middleware - Redirect authenticated users away
 */
const guestMiddleware = (req, res, next) => {
  if (req.session?.user && req.session?.token) {
    return res.redirect("/dashboard");
  }
  next();
};

/**
 * Rate Limiting Middleware for Login Attempts
 */
const loginAttemptMiddleware = (() => {
  const attempts = new Map();
  const MAX_ATTEMPTS = 5;
  const WINDOW = 15 * 60 * 1000; // 15 minutes

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!attempts.has(ip)) {
      attempts.set(ip, []);
    }

    // Clean old attempts
    const ipAttempts = attempts
      .get(ip)
      .filter((time) => now - time < WINDOW);
    attempts.set(ip, ipAttempts);

    if (ipAttempts.length >= MAX_ATTEMPTS) {
      console.warn(
        `Too many login attempts from IP: ${ip} (${ipAttempts.length}/${MAX_ATTEMPTS})`
      );
      return res.status(429).json({
        success: false,
        message:
          "Too many login attempts. Please try again in 15 minutes.",
      });
    }

    // Add this attempt
    ipAttempts.push(now);

    next();
  };
})();

/**
 * CSRF Token Middleware
 */
const csrfTokenMiddleware = (req, res, next) => {
  // Generate CSRF token for POST requests
  const session = req.session;

  if (!session.csrfToken) {
    const crypto = require("crypto");
    session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  res.locals.csrfToken = session.csrfToken;
  next();
};

/**
 * CSRF Token Verification Middleware
 */
const verifyCsrfToken = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
    const token =
      req.body._csrf ||
      req.headers["x-csrf-token"];
    const sessionToken = req.session?.csrfToken;

    if (!token || !sessionToken || token !== sessionToken) {
      console.warn("CSRF token verification failed");
      return res.status(403).json({
        success: false,
        message: "CSRF token validation failed",
      });
    }
  }

  next();
};

/**
 * Audit Logger Middleware
 */
const auditLoggerMiddleware = (req, res, next) => {
  // Log request details
  const userId = req.user?.id || req.session?.user?.id || "anonymous";
  const method = req.method;
  const path = req.path;
  const ip = req.ip;

  // Log sensitive operations
  if (["POST", "PUT", "DELETE"].includes(method)) {
    console.log(`[AUDIT] ${method} ${path} by user: ${userId} from IP: ${ip}`);
  }

  next();
};

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = {
  authMiddleware,
  roleMiddleware,
  optionalAuthMiddleware,
  guestMiddleware,
  loginAttemptMiddleware,
  csrfTokenMiddleware,
  verifyCsrfToken,
  auditLoggerMiddleware,
  errorHandler,
};
