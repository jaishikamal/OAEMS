const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../Models");

/**
 * Get UserManagement models dynamically
 */
function getUserManagementModels() {
  try {
    // Load UserManagement models
    const UserModel = require("../UserManagement/models/User")(
      db.sequelize,
      db.Sequelize
    );
    const RoleModel = require("../UserManagement/models/Role")(
      db.sequelize,
      db.Sequelize
    );
    const BranchModel = require("../UserManagement/models/Branch")(
      db.sequelize,
      db.Sequelize
    );

    return {
      User: UserModel,
      Role: RoleModel,
      Branch: BranchModel,
    };
  } catch (error) {
    console.error(
      "Error loading UserManagement models:",
      error.message
    );
    return null;
  }
}

/**
 * Render login page (GET request)
 */
exports.login = (req, res) => {
  console.log("📋 [LOGIN] GET /auth/login - Rendering login page");
  
  // If already logged in, redirect to dashboard
  if (req.session?.user) {
    console.log(`✅ [LOGIN] User already authenticated: ${req.session.user.email} - Redirecting to dashboard`);
    return res.redirect("/dashboard");
  }

  const errors = req.flash("error");
  const messages = req.flash("success");
  
  console.log(`🔐 [LOGIN] Displaying login form (${errors.length} error(s), ${messages.length} success message(s))`);
  
  res.render("auth/login", {
    pageTitle: "Login - OAEMS",
    layout: false,
    errorMessage: errors[0] || null,
    successMessage: messages[0] || null,
  });
};

/**
 * Handle login form submission (POST request)
 */
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip;
    
    console.log(`\n📝 [LOGIN] POST /auth/login - Login attempt`);
    console.log(`   🌐 IP Address: ${clientIp}`);
    console.log(`   👤 Email/Username: ${email}`);

    // Validate input
    if (!email || !password) {
      console.warn(`⚠️  [LOGIN] Missing credentials - email: ${!!email}, password: ${!!password}`);
      req.flash("error", "❌ Email and password are required");
      return res.redirect("/auth/login");
    }

    // Get User model
    const User = db.User || getUserManagementModels()?.User;
    if (!User) {
      console.error("❌ [LOGIN] User model not found - System configuration error");
      req.flash("error", "❌ System configuration error. Please contact administrator.");
      return res.redirect("/auth/login");
    }

    console.log(`🔍 [LOGIN] Querying database for user...`);

    // Find user by email or username (unscoped to include password)
    const user = await User.unscoped().findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { username: email }],
      },
      attributes: { include: ["password"] }, // Explicitly include password for auth
    });

    // User not found or invalid credentials
    if (!user) {
      console.warn(`❌ [LOGIN] User not found - Email/Username: ${email} from ${clientIp}`);
      req.flash("error", "❌ Invalid email or password");
      return res.redirect("/auth/login");
    }

    console.log(`✅ [LOGIN] User found: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`   📊 Status: ${user.status}`);
    console.log(`   🔒 Locked: ${user.isLocked}`);
    console.log(`   ❌ Failed attempts: ${user.failedLoginAttempts}`);

    // Check if user account is active
    if (user.status !== "active") {
      console.warn(`⚠️  [LOGIN] User account inactive - Account status: ${user.status}`);
      req.flash("error", `❌ Account is ${user.status}. Please contact administrator.`);
      return res.redirect("/auth/login");
    }

    // Check if user is locked
    if (user.isLocked && user.lockUntil && user.lockUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil - new Date()) / 60000);
      console.warn(`🔐 [LOGIN] User account locked - Locked until: ${user.lockUntil} (${minutesRemaining} min remaining)`);
      req.flash("error", `❌ Account is locked. Try again in ${minutesRemaining} minutes.`);
      return res.redirect("/auth/login");
    }

    // Verify password
    console.log(`🔐 [LOGIN] Verifying password...`);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.warn(`❌ [LOGIN] Invalid password for user: ${email}`);

      // Increment failed login attempts
      const newFailedAttempts = user.failedLoginAttempts + 1;
      
      if (newFailedAttempts < 5) {
        await user.update({
          failedLoginAttempts: newFailedAttempts,
        });
        console.log(`   ⚠️  Failed attempts: ${newFailedAttempts}/5`);
        req.flash("error", `❌ Invalid password. Attempt ${newFailedAttempts}/5`);
      } else {
        // Lock account after 5 failed attempts
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.update({
          isLocked: true,
          lockUntil,
          failedLoginAttempts: newFailedAttempts,
        });
        console.log(`   🔒 Account locked for 30 minutes`);
        req.flash("error", "❌ Too many failed attempts. Account locked for 30 minutes.");
      }
      
      return res.redirect("/auth/login");
    }

    // Password correct - reset failed attempts
    console.log(`✅ [LOGIN] Password verified successfully`);
    
    await user.update({
      failedLoginAttempts: 0,
      isLocked: false,
      lastLogin: new Date(),
    });

    console.log(`🔄 [LOGIN] Failed attempts reset, last login updated`);

    // Fetch roles and branches separately (since associations may not be loaded)
    console.log(`📋 [LOGIN] Fetching user roles and branches...`);
    let userRoles = [];
    let userBranches = [];
    
    try {
      // Query roles using raw SQL
      const roleResults = await db.sequelize.query(`
        SELECT r.id, r.code, r.name
        FROM roles r
        INNER JOIN user_roles ur ON r.id = ur.roleId
        WHERE ur.userId = :userId
      `, {
        replacements: { userId: user.id },
        type: db.Sequelize.QueryTypes.SELECT,
      });
      userRoles = roleResults || [];

      // Query branches using raw SQL
      const branchResults = await db.sequelize.query(`
        SELECT b.id, b.code, b.name
        FROM branches b
        INNER JOIN user_branches ub ON b.id = ub.branchId
        WHERE ub.userId = :userId
      `, {
        replacements: { userId: user.id },
        type: db.Sequelize.QueryTypes.SELECT,
      });
      userBranches = branchResults || [];

      console.log(`✅ [LOGIN] Roles and branches loaded`);
    } catch (error) {
      console.warn(`⚠️  [LOGIN] Could not fetch associated roles/branches:`, error.message);
      // Continue anyway - roles and branches will be empty but login can proceed
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: userRoles?.map((r) => r.code) || [],
        branches: userBranches?.map((b) => ({ id: b.id, code: b.code })) || [],
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    console.log(`🎫 [LOGIN] JWT token generated - Expires in 24h`);
    console.log(`   👥 Roles: ${userRoles?.map(r => r.name).join(", ") || "No roles"}`);
    console.log(`   🏢 Branches: ${userBranches?.map(b => b.name).join(", ") || "No branches"}`);

    // Store user info in session
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      roles: userRoles || [],
      branches: userBranches || [],
    };

    req.session.token = token;

    console.log(`💾 [LOGIN] Saving session...`);

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error(`❌ [LOGIN] Session save failed:`, err.message);
        req.flash("error", "❌ Session error. Please try again.");
        return res.redirect("/auth/login");
      }

      console.log(`✅ [LOGIN] Session saved successfully`);
      console.log(`🎉 [LOGIN] User ${user.email} logged in successfully from ${clientIp}\n`);
      
      req.flash("success", `✅ Welcome ${user.firstName}! You are now logged in.`);
      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error(`❌ [LOGIN] Error during login:`, error.message);
    console.error(`   Stack: ${error.stack}`);
    req.flash("error", `❌ Login error: ${error.message}`);
    return res.redirect("/auth/login");
  }
};

/**
 * Render register page (GET request) - DISABLED - Admin only
 * Users are created by administrators with proper permissions
 */
exports.register = (req, res) => {
  console.log("📋 [REGISTER] GET /auth/register - Registration disabled (Admin only)");
  req.flash("error", "❌ User registration is disabled. Contact your administrator.");
  return res.redirect("/auth/login");
};

/**
 * Handle registration form submission (POST request) - DISABLED
 * Users are created by administrators with proper permissions
 */
exports.postRegister = (req, res) => {
  console.log("📝 [REGISTER] POST /auth/register - Registration disabled (Admin only)");
  req.flash("error", "❌ User registration is disabled. Contact your administrator.");
  return res.redirect("/auth/login");
};

/**
 * Handle logout
 */
exports.logout = async (req, res) => {
  try {
    const user = req.session?.user;

    if (user) {
      console.log(`\n👋 [LOGOUT] User logging out: ${user.email}`);
      console.log(`   ⏰ Last login: ${new Date().toLocaleString()}`);
    } else {
      console.log(`\n👋 [LOGOUT] Logout attempt with no active session`);
    }

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error(`❌ [LOGOUT] Session destroy error:`, err.message);
      } else {
        console.log(`✅ [LOGOUT] Session destroyed successfully`);
      }
      
      // Clear cookies
      res.clearCookie("connect.sid");
      console.log(`✅ [LOGOUT] Cookies cleared\n`);
      
      req.flash("success", "✅ You have been logged out successfully.");
      return res.redirect("/auth/login");
    });
  } catch (error) {
    console.error(`❌ [LOGOUT] Error during logout:`, error.message);
    res.redirect("/auth/login");
  }
};

/**
 * Check if user is authenticated (middleware-like)
 */
exports.checkAuth = (req, res, next) => {
  if (!req.session?.user || !req.session?.token) {
    console.warn("No session or token, redirecting to login");
    return res.redirect("/auth/login");
  }
  next();
};

/**
 * Get current user info
 */
exports.getCurrentUser = (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  res.json({
    success: true,
    user: req.session.user,
  });
};