/**
 * User Management System - Repository Pattern Implementation
 * 
 * This module provides enterprise-grade user management with:
 * - JWT Authentication with access/refresh tokens
 * - Role-Based Access Control (RBAC)
 * - Permission-Based Authorization
 * - Multi-branch and multi-role user support
 * - Comprehensive audit logging
 * - Login attempt tracking and account locking
 * - Soft deletes for data integrity
 * 
 * INSTALLATION & SETUP
 * ====================
 * 
 * 1. Install required dependencies:
 *    npm install bcryptjs jsonwebtoken joi cookie-parser
 * 
 * 2. Update your Models/index.js to include UserManagement models
 *    See integration guide below
 * 
 * 3. Update your app.js to include the routes
 *    See integration guide below
 * 
 * 4. Create migrations for all UserManagement models
 *    npx sequelize-cli migration:create ...
 * 
 * 5. Run migrations
 *    npx sequelize-cli db:migrate
 * 
 * 6. Seed initial data (roles, permissions, branches)
 *    See seeds folder
 * 
 * FOLDER STRUCTURE
 * ================
 * UserManagement/
 * ├── models/                    # Database models
 * │   ├── User.js
 * │   ├── Role.js
 * │   ├── Permission.js
 * │   ├── Branch.js
 * │   ├── UserRole.js
 * │   ├── UserBranch.js
 * │   ├── UserPermission.js
 * │   ├── RolePermission.js
 * │   ├── AuditLog.js
 * │   ├── LoginAttempt.js
 * │   └── RefreshToken.js
 * ├── repositories/              # Data access layer
 * │   ├── BaseRepository.js
 * │   ├── UserRepository.js
 * │   ├── RoleRepository.js
 * │   ├── PermissionRepository.js
 * │   ├── BranchRepository.js
 * │   ├── AuditLogRepository.js
 * │   └── LoginAttemptRepository.js
 * ├── services/                  # Business logic
 * │   ├── UserService.js
 * │   ├── AuthService.js
 * │   ├── RoleService.js
 * │   ├── PermissionService.js
 * │   └── BranchService.js
 * ├── controllers/               # Request handlers
 * │   ├── AuthController.js
 * │   ├── UserController.js
 * │   ├── RoleController.js
 * │   ├── PermissionController.js
 * │   └── BranchController.js
 * ├── middleware/                # Express middleware
 * │   └── auth.js
 * ├── validators/                # Input validation
 * │   └── UserValidator.js
 * ├── routes/                    # API routes
 * │   └── userManagementRoutes.js
 * ├── dtos/                      # Data transfer objects (future)
 * ├── mappers/                   # DTO mappers (future)
 * └── README.md
 * 
 * API ENDPOINTS OVERVIEW
 * ======================
 * 
 * AUTH
 * POST   /api/um/auth/login              - Login user
 * POST   /api/um/auth/refresh-token      - Refresh access token
 * POST   /api/um/auth/logout             - Logout user
 * GET    /api/um/auth/me                 - Get current user
 * 
 * USERS
 * POST   /api/um/users                   - Create user (Admin)
 * GET    /api/um/users                   - List users
 * GET    /api/um/users/search            - Search users
 * GET    /api/um/users/:userId           - Get user by ID
 * PUT    /api/um/users/:userId           - Update user
 * DELETE /api/um/users/:userId           - Delete user (soft)
 * POST   /api/um/users/:userId/roles/:roleId            - Assign role
 * DELETE /api/um/users/:userId/roles/:roleId            - Remove role
 * POST   /api/um/users/:userId/branches/:branchId       - Assign branch
 * DELETE /api/um/users/:userId/branches/:branchId       - Remove branch
 * POST   /api/um/users/:userId/permissions/:permissionId - Assign permission
 * DELETE /api/um/users/:userId/permissions/:permissionId - Remove permission
 * POST   /api/um/users/:userId/change-password          - Change password
 * POST   /api/um/users/:userId/reset-password           - Reset password (Admin)
 * POST   /api/um/users/:userId/suspend                  - Suspend user
 * POST   /api/um/users/:userId/activate                 - Activate user
 * 
 * ROLES
 * POST   /api/um/roles                   - Create role (Admin)
 * GET    /api/um/roles                   - List roles
 * GET    /api/um/roles/search            - Search roles
 * GET    /api/um/roles/system            - Get system roles
 * GET    /api/um/roles/:roleId           - Get role by ID
 * PUT    /api/um/roles/:roleId           - Update role (Admin)
 * DELETE /api/um/roles/:roleId           - Delete role (Admin)
 * POST   /api/um/roles/:roleId/permissions/:permissionId    - Assign permission
 * DELETE /api/um/roles/:roleId/permissions/:permissionId    - Remove permission
 * POST   /api/um/roles/:roleId/permissions               - Assign multiple permissions
 * 
 * PERMISSIONS
 * POST   /api/um/permissions             - Create permission (Admin)
 * GET    /api/um/permissions             - List permissions
 * GET    /api/um/permissions/search      - Search permissions
 * GET    /api/um/permissions/system      - Get system permissions
 * GET    /api/um/permissions/module/:module - Get by module
 * GET    /api/um/permissions/grouped/by-module - Group by module
 * GET    /api/um/permissions/:permissionId - Get permission by ID
 * PUT    /api/um/permissions/:permissionId - Update permission (Admin)
 * DELETE /api/um/permissions/:permissionId - Delete permission (Admin)
 * GET    /api/um/users/:userId/permissions - Get user permissions
 * GET    /api/um/roles/:roleId/permissions - Get role permissions
 * 
 * BRANCHES
 * POST   /api/um/branches                - Create branch (Admin)
 * GET    /api/um/branches                - List branches
 * GET    /api/um/branches/active         - Get active branches
 * GET    /api/um/branches/search         - Search branches
 * GET    /api/um/branches/level/:level   - Get by level
 * GET    /api/um/branches/:branchId      - Get branch by ID
 * PUT    /api/um/branches/:branchId      - Update branch (Admin)
 * DELETE /api/um/branches/:branchId      - Delete branch (Admin)
 * GET    /api/um/branches/:parentBranchId/children  - Get child branches
 * POST   /api/um/branches/:branchId/users/:userId   - Add user to branch
 * DELETE /api/um/branches/:branchId/users/:userId   - Remove user from branch
 * 
 * USAGE EXAMPLES
 * ==============
 * 
 * 1. LOGIN
 * POST /api/um/auth/login
 * {
 *   "emailOrUsername": "john@example.com",
 *   "password": "SecurePass123"
 * }
 * Response:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "accessToken": "eyJhbGc...",
 *     "user": { "id": "...", "email": "...", "roles": [...], "branches": [...] }
 *   }
 * }
 * 
 * 2. CREATE USER
 * POST /api/um/users
 * {
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "email": "john@example.com",
 *   "username": "johndoe",
 *   "password": "SecurePass123"
 * }
 * 
 * 3. ASSIGN ROLE
 * POST /api/um/users/user-id/roles/role-id
 * Response: { "success": true, "message": "Role assigned successfully" }
 * 
 * 4. ASSIGN BRANCH
 * POST /api/um/users/user-id/branches/branch-id
 * {
 *   "accessLevel": "full"   // or "limited", "read_only"
 * }
 * 
 * 5. CREATE ROLE
 * POST /api/um/roles
 * {
 *   "code": "RISK_MANAGER",
 *   "name": "Risk Manager",
 *   "description": "Manages risk assessments"
 * }
 * 
 * 6. CREATE PERMISSION
 * POST /api/um/permissions
 * {
 *   "code": "user.create",
 *   "name": "Create User",
 *   "module": "UserManagement",
 *   "resource": "user",
 *   "action": "create"
 * }
 * 
 * AUTHENTICATION
 * ==============
 * 
 * All protected endpoints require JWT token in Authorization header:
 * Authorization: Bearer <accessToken>
 * 
 * Tokens are JWT-encoded with payload:
 * {
 *   "userId": "uuid",
 *   "email": "user@example.com",
 *   "roles": ["ROLE_CODE"],
 *   "branches": [{ "id": "uuid", "code": "BRANCH_CODE", "accessLevel": "full" }],
 *   "defaultBranchId": "uuid"
 * }
 * 
 * ACCESS CONTROL
 * ==============
 * 
 * System uses role-based middleware:
 * - @roleMiddleware("ADMIN") - checks if user has ADMIN role
 * - Multiple roles can be specified: @roleMiddleware("ADMIN", "BRANCH_MANAGER")
 * 
 * Default System Roles:
 * - ADMIN (Superuser)
 * - BRANCH_MANAGER
 * - STAFF
 * - AUDITOR
 * - RISK_MANAGER
 * - REVIEWER
 * 
 * SECURITY FEATURES
 * =================
 * 
 * 1. Password Security
 *    - BCrypt hashing with salt rounds = 10
 *    - Minimum 8 characters
 *    - Must contain uppercase, lowercase, and numbers
 * 
 * 2. Account Locking
 *    - Auto-locks after 5 failed login attempts
 *    - Locks for 30 minutes
 *    - Manual unlock via admin
 * 
 * 3. Session Management
 *    - Access Token: 15 minutes
 *    - Refresh Token: 7 days
 *    - Tokens stored in database
 *    - Refresh tokens can be revoked
 * 
 * 4. Audit Logging
 *    - All user actions logged
 *    - Tracks IP, user agent, timestamp
 *    - Stores old and new values for updates
 * 
 * 5. Login Attempt Tracking
 *    - Logs all login attempts (success/failure)
 *    - Tracks failed reasons
 *    - Used for security insights
 * 
 * INTEGRATION GUIDE
 * =================
 * 
 * 1. UPDATE Models/index.js
 * 
 * Add this after the existing model loading code:
 * 
 * // Load UserManagement models
 * const userModels = require('../UserManagement/models');
 * for (const modelFile of fs.readdirSync(path.join(__dirname, '../UserManagement/models'))) {
 *   if (modelFile.endsWith('.js') && modelFile !== 'index.js') {
 *     const model = require(path.join(__dirname, '../UserManagement/models', modelFile))(
 *       sequelize,
 *       Sequelize.DataTypes,
 *     );
 *     db[model.name] = model;
 *   }
 * }
 * 
 * 2. UPDATE app.js
 * 
 * Add this in your app.js after other middleware:
 * 
 * // Import UserManagement routes
 * const createUserManagementRoutes = require('./UserManagement/routes/userManagementRoutes');
 * const { authMiddleware, auditMiddleware } = require('./UserManagement/middleware/auth');
 * 
 * // Get database models
 * const db = require('./Models');
 * 
 * // Apply UserManagement routes
 * const umRoutes = createUserManagementRoutes(db);
 * app.use('/api/um', umRoutes);
 * 
 * 3. ENVIRONMENT VARIABLES
 * 
 * Add to your .env file:
 * 
 * ACCESS_TOKEN_SECRET=your-access-token-secret-key-here
 * REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-here
 * ACCESS_TOKEN_EXPIRY=15m
 * REFRESH_TOKEN_EXPIRY=7d
 * REFRESH_TOKEN_EXPIRY_DAYS=7
 * 
 * 4. NPM DEPENDENCIES
 * 
 * Make sure these are installed:
 * npm install bcryptjs jsonwebtoken joi cookie-parser
 * 
 * TESTING
 * =======
 * 
 * Use Postman or similar tool to test endpoints:
 * 
 * 1. Login to get tokens
 * 2. Use accessToken in Authorization header for subsequent requests
 * 3. Test each endpoint with appropriate permissions
 * 4. Check audit logs for tracking
 * 
 * TROUBLESHOOTING
 * ===============
 * 
 * Issue: "No token provided"
 * Solution: Include Authorization header with Bearer token
 * 
 * Issue: "User not found"
 * Solution: Check email/username spelling, ensure user exists
 * 
 * Issue: "Insufficient permissions"
 * Solution: User doesn't have required role, assign role first
 * 
 * Issue: "User account is locked"
 * Solution: Wait 30 minutes or admin resets account
 * 
 * FUTURE ENHANCEMENTS
 * ===================
 * 
 * 1. Add DTOs (Data Transfer Objects) for request/response validation
 * 2. Add MapStruct-like mapper for DTO conversion
 * 3. Add GraphQL support
 * 4. Add WebSocket notifications for real-time updates
 * 5. Add Two-Factor Authentication (2FA)
 * 6. Add OAuth2 integration
 * 7. Add API key authentication
 * 8. Add request/response logging
 * 9. Add performance monitoring
 * 10. Add email notifications
 */

module.exports = {
  version: "1.0.0",
  name: "User Management System",
  description: "Enterprise-grade user management with repository pattern",
};
