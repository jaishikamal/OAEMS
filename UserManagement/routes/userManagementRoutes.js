const express = require("express");
const AuthController = require("../controllers/AuthController");
const UserController = require("../controllers/UserController");
const RoleController = require("../controllers/RoleController");
const PermissionController = require("../controllers/PermissionController");
const BranchController = require("../controllers/BranchController");
const {
  authMiddleware,
  roleMiddleware,
  loginRateLimiter,
  branchAccessMiddleware,
} = require("../middleware/auth");

/**
 * Create User Management Routes
 */
const createUserManagementRoutes = (models) => {
  const router = express.Router();

  // Initialize controllers
  const authController = new AuthController(models);
  const userController = new UserController(models);
  const roleController = new RoleController(models);
  const permissionController = new PermissionController(models);
  const branchController = new BranchController(models);

  // Apply rate limiter to login
  const rateLimiter = loginRateLimiter(models);

  // ========== AUTH ROUTES ==========
  router.post("/auth/login", rateLimiter, (req, res) =>
    authController.login(req, res),
  );
  router.post("/auth/refresh-token", (req, res) =>
    authController.refreshToken(req, res),
  );
  router.post("/auth/logout", authMiddleware, (req, res) =>
    authController.logout(req, res),
  );
  router.get("/auth/me", authMiddleware, (req, res) =>
    authController.getCurrentUser(req, res),
  );

  // ========== USER ROUTES ==========
  // Create user (Admin only)
  router.post(
    "/users",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.createUser(req, res),
  );

  // Get all users (Admin/Manager)
  router.get(
    "/users",
    authMiddleware,
    roleMiddleware("ADMIN", "BRANCH_MANAGER"),
    (req, res) => userController.listUsers(req, res),
  );

  // Search users
  router.get("/users/search", authMiddleware, (req, res) =>
    userController.searchUsers(req, res),
  );

  // Get user by ID
  router.get("/users/:userId", authMiddleware, (req, res) =>
    userController.getUserById(req, res),
  );

  // Update user (Admin or self)
  router.put("/users/:userId", authMiddleware, (req, res) =>
    userController.updateUser(req, res),
  );

  // Delete user (Admin only)
  router.delete(
    "/users/:userId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.deleteUser(req, res),
  );

  // Assign role to user
  router.post(
    "/users/:userId/roles/:roleId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.assignRoleToUser(req, res),
  );

  // Remove role from user
  router.delete(
    "/users/:userId/roles/:roleId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.removeRoleFromUser(req, res),
  );

  // Assign branch to user
  router.post(
    "/users/:userId/branches/:branchId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.assignBranchToUser(req, res),
  );

  // Remove branch from user
  router.delete(
    "/users/:userId/branches/:branchId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.removeBranchFromUser(req, res),
  );

  // Assign permission to user
  router.post(
    "/users/:userId/permissions/:permissionId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.assignPermissionToUser(req, res),
  );

  // Remove permission from user
  router.delete(
    "/users/:userId/permissions/:permissionId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.removePermissionFromUser(req, res),
  );

  // Change password (Self)
  router.post("/users/:userId/change-password", authMiddleware, (req, res) =>
    userController.changePassword(req, res),
  );

  // Reset password (Admin only)
  router.post(
    "/users/:userId/reset-password",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.resetPassword(req, res),
  );

  // Suspend user
  router.post(
    "/users/:userId/suspend",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.suspendUser(req, res),
  );

  // Activate user
  router.post(
    "/users/:userId/activate",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => userController.activateUser(req, res),
  );

  // ========== ROLE ROUTES ==========
  // Create role (Admin only)
  router.post(
    "/roles",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => roleController.createRole(req, res),
  );

  // Get all roles
  router.get("/roles", authMiddleware, (req, res) =>
    roleController.listRoles(req, res),
  );

  // Search roles
  router.get("/roles/search", authMiddleware, (req, res) =>
    roleController.searchRoles(req, res),
  );

  // Get system roles
  router.get("/roles/system", authMiddleware, (req, res) =>
    roleController.getSystemRoles(req, res),
  );

  // Get role by ID
  router.get("/roles/:roleId", authMiddleware, (req, res) =>
    roleController.getRoleById(req, res),
  );

  // Update role (Admin only)
  router.put(
    "/roles/:roleId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => roleController.updateRole(req, res),
  );

  // Delete role (Admin only)
  router.delete(
    "/roles/:roleId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => roleController.deleteRole(req, res),
  );

  // Assign permission to role
  router.post(
    "/roles/:roleId/permissions/:permissionId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => roleController.assignPermissionToRole(req, res),
  );

  // Remove permission from role
  router.delete(
    "/roles/:roleId/permissions/:permissionId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => roleController.removePermissionFromRole(req, res),
  );

  // Assign multiple permissions to role
  router.post(
    "/roles/:roleId/permissions",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => roleController.assignPermissionsToRole(req, res),
  );

  // ========== PERMISSION ROUTES ==========
  // Create permission (Admin only)
  router.post(
    "/permissions",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => permissionController.createPermission(req, res),
  );

  // Get all permissions
  router.get("/permissions", authMiddleware, (req, res) =>
    permissionController.listPermissions(req, res),
  );

  // Search permissions
  router.get("/permissions/search", authMiddleware, (req, res) =>
    permissionController.searchPermissions(req, res),
  );

  // Get system permissions
  router.get("/permissions/system", authMiddleware, (req, res) =>
    permissionController.getSystemPermissions(req, res),
  );

  // Get permissions by module
  router.get("/permissions/module/:module", authMiddleware, (req, res) =>
    permissionController.getPermissionsByModule(req, res),
  );

  // Group permissions by module
  router.get("/permissions/grouped/by-module", authMiddleware, (req, res) =>
    permissionController.groupPermissionsByModule(req, res),
  );

  // Get permission by ID
  router.get("/permissions/:permissionId", authMiddleware, (req, res) =>
    permissionController.getPermissionById(req, res),
  );

  // Update permission (Admin only)
  router.put(
    "/permissions/:permissionId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => permissionController.updatePermission(req, res),
  );

  // Delete permission (Admin only)
  router.delete(
    "/permissions/:permissionId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => permissionController.deletePermission(req, res),
  );

  // Get user permissions
  router.get(
    "/users/:userId/permissions",
    authMiddleware,
    (req, res) => permissionController.getUserPermissions(req, res),
  );

  // Get role permissions
  router.get(
    "/roles/:roleId/permissions",
    authMiddleware,
    (req, res) => permissionController.getRolePermissions(req, res),
  );

  // ========== BRANCH ROUTES ==========
  // Create branch (Admin only)
  router.post(
    "/branches",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => branchController.createBranch(req, res),
  );

  // Get all branches
  router.get("/branches", authMiddleware, (req, res) =>
    branchController.listBranches(req, res),
  );

  // Get active branches
  router.get("/branches/active", authMiddleware, (req, res) =>
    branchController.getActiveBranches(req, res),
  );

  // Search branches
  router.get("/branches/search", authMiddleware, (req, res) =>
    branchController.searchBranches(req, res),
  );

  // Get branches by level
  router.get("/branches/level/:level", authMiddleware, (req, res) =>
    branchController.getBranchesByLevel(req, res),
  );

  // Get branch by ID
  router.get("/branches/:branchId", authMiddleware, (req, res) =>
    branchController.getBranchById(req, res),
  );

  // Update branch (Admin only)
  router.put(
    "/branches/:branchId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => branchController.updateBranch(req, res),
  );

  // Delete branch (Admin only)
  router.delete(
    "/branches/:branchId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => branchController.deleteBranch(req, res),
  );

  // Get child branches
  router.get("/branches/:parentBranchId/children", authMiddleware, (req, res) =>
    branchController.getChildBranches(req, res),
  );

  // Add user to branch
  router.post(
    "/branches/:branchId/users/:userId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => branchController.addUserToBranch(req, res),
  );

  // Remove user from branch
  router.delete(
    "/branches/:branchId/users/:userId",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => branchController.removeUserFromBranch(req, res),
  );

  return router;
};

module.exports = createUserManagementRoutes;
