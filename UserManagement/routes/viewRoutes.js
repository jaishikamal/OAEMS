const express = require('express');
const router = express.Router();
const viewController = require('../controllers/ViewController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

/**
 * All view routes are authenticated and require proper role access
 */

// ===== PUBLIC ROUTES =====
router.get('/login', viewController.renderLogin);

// ===== AUTHENTICATED ROUTES =====
// All routes below require authentication

// Dashboard
router.get('/dashboard', authMiddleware, viewController.renderDashboard);

// User Management Views
router.get('/users', authMiddleware, roleMiddleware('ADMIN', 'BRANCH_MANAGER'), viewController.renderUserList);
router.get('/users/create', authMiddleware, roleMiddleware('ADMIN'), viewController.renderCreateUser);
router.get('/users/:id/view', authMiddleware, viewController.renderViewUser);
router.get('/users/:id/edit', authMiddleware, roleMiddleware('ADMIN'), viewController.renderEditUser);
router.get('/users/:id/change-password', authMiddleware, viewController.renderChangePassword);

// Role Management Views
router.get('/roles', authMiddleware, roleMiddleware('ADMIN'), viewController.renderRoleList);
router.get('/roles/create', authMiddleware, roleMiddleware('ADMIN'), viewController.renderCreateRole);
router.get('/roles/:id/view', authMiddleware, roleMiddleware('ADMIN'), viewController.renderViewRole);
router.get('/roles/:id/edit', authMiddleware, roleMiddleware('ADMIN'), viewController.renderEditRole);

// Permission Management Views
router.get('/permissions', authMiddleware, roleMiddleware('ADMIN'), viewController.renderPermissionList);
router.get('/permissions/create', authMiddleware, roleMiddleware('ADMIN'), viewController.renderCreatePermission);
router.get('/permissions/:id/edit', authMiddleware, roleMiddleware('ADMIN'), viewController.renderEditPermission);

// Branch Management Views
router.get('/branches', authMiddleware, roleMiddleware('ADMIN', 'BRANCH_MANAGER'), viewController.renderBranchList);
router.get('/branches/create', authMiddleware, roleMiddleware('ADMIN'), viewController.renderCreateBranch);
router.get('/branches/:id/view', authMiddleware, viewController.renderViewBranch);
router.get('/branches/:id/edit', authMiddleware, roleMiddleware('ADMIN'), viewController.renderEditBranch);

// Audit Logs Views
router.get('/audit-logs', authMiddleware, roleMiddleware('ADMIN', 'AUDITOR'), viewController.renderAuditLogs);

// Profile Views
router.get('/profile', authMiddleware, viewController.renderProfile);

module.exports = router;
