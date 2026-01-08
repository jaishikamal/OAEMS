// External Module
const express = require("express");

// Local modules
const userRouter = express.Router();
const authController = require("../Controllers/Auth");
const dashboardController = require("../Controllers/Dashboard");
const Approval = require("../Controllers/Approval");
const Expenses = require("../Controllers/Expenses");
const Budget = require("../Controllers/Budget");
const Audit_Trail = require("../Controllers/Aduit");
const Report = require("../Controllers/Report");
const FormData = require("../Controllers/FromBuilder");
const User_Management = require("../Controllers/UserManagement");
const Setting = require("../Controllers/Setting");
const Branches = require("../Controllers/Branches");
const Approve_Type = require("../Controllers/Approve_Type");
const RolesController = require("../Controllers/RolesController"); 

// ============================================
// Page Routes
// ============================================
userRouter.get("/", authController.login);
userRouter.get("/dashboard", dashboardController.dashboard);
userRouter.get("/approval", Approval.approval);
userRouter.get("/expenses", Expenses.expense);
userRouter.get("/budget", Budget.budget);
userRouter.get("/audit", Audit_Trail.aduit);
userRouter.get("/report", Report.report);
userRouter.get("/fromBuilder", FormData.fromBuilder);
userRouter.get("/userManagement", User_Management.userManagement);
userRouter.get("/setting", Setting.setting);
userRouter.get("/branches", Branches.branches);
userRouter.get("/approve_type", Approve_Type.approve_type);
userRouter.get("/roles", RolesController.getRoles);

// ============================================
// Auth Routes
// ============================================
userRouter.post("/login", authController.postLogin);
userRouter.post("/logout", authController.logout);

// ============================================
// User Management API Routes
// ============================================

// CRUD operations
userRouter.post("/api/users", User_Management.createUser);
userRouter.put("/api/users/:id", User_Management.updateUser);
userRouter.delete("/api/users/:id", User_Management.deleteUser);

// Role management
userRouter.post("/api/users/:userId/assign-role", User_Management.assignRole);
userRouter.post("/api/users/bulk/assign-role", User_Management.bulkAssignRole);

// Role permissions
userRouter.get("/api/roles/:roleId/permissions", User_Management.getRolePermissions);

module.exports = userRouter;