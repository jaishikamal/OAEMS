const express = require('express');
const { viewAuthMiddleware, roleMiddleware } = require('../middleware/auth');

/**
 * Create View Routes - Factory function that takes models
 */
const createViewRoutes = (models) => {
  const router = express.Router();
  const viewController = require('../controllers/ViewController')(models);

  /**
   * All view routes are authenticated and require proper role access
   */

  // ===== PUBLIC ROUTES =====
  router.get('/login', viewController.renderLogin);

  // ===== AUTHENTICATED ROUTES =====
  // All routes below require authentication

  // Dashboard
  router.get('/dashboard', viewAuthMiddleware, viewController.renderDashboard);

  // User Management Views
  router.get('/users', viewAuthMiddleware, roleMiddleware('ADMIN', 'BRANCH_MANAGER'), viewController.renderUserList);
  router.get('/users/create', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderCreateUser);
  router.get('/users/:id/view', viewAuthMiddleware, viewController.renderViewUser);
  router.get('/users/:id/edit', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderEditUser);
  router.get('/users/:id/change-password', viewAuthMiddleware, viewController.renderChangePassword);

  // Role Management Views
  router.get('/roles', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderRoleList);
  router.get('/roles/create', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderCreateRole);
  router.get('/roles/:id/view', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderViewRole);
  router.get('/roles/:id/edit', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderEditRole);

  // Permission Management Views
  router.get('/permissions', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderPermissionList);
  router.get('/permissions/create', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderCreatePermission);
  router.get('/permissions/:id/edit', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderEditPermission);

  // Branch Management Views
  router.get('/branches', viewAuthMiddleware, roleMiddleware('ADMIN', 'BRANCH_MANAGER'), viewController.renderBranchList);
  router.get('/branches/create', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderCreateBranch);
  router.get('/branches/:id/view', viewAuthMiddleware, viewController.renderViewBranch);
  router.get('/branches/:id/edit', viewAuthMiddleware, roleMiddleware('ADMIN'), viewController.renderEditBranch);

  // Audit Logs Views
  router.get('/audit-logs', viewAuthMiddleware, roleMiddleware('ADMIN', 'AUDITOR'), viewController.renderAuditLogs);

  // Profile Views
  router.get('/profile', viewAuthMiddleware, viewController.renderProfile);

  return router;
};

module.exports = createViewRoutes;
