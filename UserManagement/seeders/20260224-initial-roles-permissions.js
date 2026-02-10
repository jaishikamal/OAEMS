/**
 * Seeder for Initial Roles and Permissions
 * 
 * Usage: npx sequelize-cli db:seed:all
 * 
 * This seeder creates system roles and permissions
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { v4: uuidv4 } = require("uuid");

    // Create system roles
    const roles = await queryInterface.bulkInsert(
      "roles",
      [
        {
          id: uuidv4(),
          code: "ADMIN",
          name: "Administrator",
          description: "Full system access",
          status: "active",
          isSystem: true,
          priority: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          code: "BRANCH_MANAGER",
          name: "Branch Manager",
          description: "Manages branch operations",
          status: "active",
          isSystem: true,
          priority: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          code: "RISK_MANAGER",
          name: "Risk Manager",
          description: "Manages risk assessments",
          status: "active",
          isSystem: true,
          priority: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          code: "AUDITOR",
          name: "Auditor",
          description: "Audit and compliance role",
          status: "active",
          isSystem: true,
          priority: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          code: "REVIEWER",
          name: "Reviewer",
          description: "Reviews submissions and approvals",
          status: "active",
          isSystem: true,
          priority: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuidv4(),
          code: "STAFF",
          name: "Staff",
          description: "General staff member",
          status: "active",
          isSystem: true,
          priority: 6,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );

    // Get role IDs
    const roleData = await queryInterface.sequelize.query(
      `SELECT id, code FROM roles WHERE isSystem = true`,
    );
    const roleMap = {};
    roleData[0].forEach((role) => {
      roleMap[role.code] = role.id;
    });

    // Create system permissions
    const permissions = await queryInterface.bulkInsert(
      "permissions",
      [
        // User Permissions
        { id: uuidv4(), code: "user.create", name: "Create User", module: "UserManagement", resource: "user", action: "create", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "user.read", name: "Read User", module: "UserManagement", resource: "user", action: "read", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "user.update", name: "Update User", module: "UserManagement", resource: "user", action: "update", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "user.delete", name: "Delete User", module: "UserManagement", resource: "user", action: "delete", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },

        // Role Permissions
        { id: uuidv4(), code: "role.create", name: "Create Role", module: "RoleManagement", resource: "role", action: "create", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "role.read", name: "Read Role", module: "RoleManagement", resource: "role", action: "read", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "role.update", name: "Update Role", module: "RoleManagement", resource: "role", action: "update", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "role.delete", name: "Delete Role", module: "RoleManagement", resource: "role", action: "delete", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },

        // Permission Permissions
        { id: uuidv4(), code: "permission.create", name: "Create Permission", module: "PermissionManagement", resource: "permission", action: "create", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "permission.read", name: "Read Permission", module: "PermissionManagement", resource: "permission", action: "read", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "permission.update", name: "Update Permission", module: "PermissionManagement", resource: "permission", action: "update", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "permission.delete", name: "Delete Permission", module: "PermissionManagement", resource: "permission", action: "delete", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },

        // Branch Permissions
        { id: uuidv4(), code: "branch.create", name: "Create Branch", module: "BranchManagement", resource: "branch", action: "create", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "branch.read", name: "Read Branch", module: "BranchManagement", resource: "branch", action: "read", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "branch.update", name: "Update Branch", module: "BranchManagement", resource: "branch", action: "update", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
        { id: uuidv4(), code: "branch.delete", name: "Delete Branch", module: "BranchManagement", resource: "branch", action: "delete", status: "active", isSystem: true, createdAt: new Date(), updatedAt: new Date() },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded data in reverse order
    await queryInterface.bulkDelete("role_permissions", null, {});
    await queryInterface.bulkDelete("permissions", { isSystem: true }, {});
    await queryInterface.bulkDelete("roles", { isSystem: true }, {});
  },
};
