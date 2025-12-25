// External Module
const express = require("express");
//local module
const userRouter = express.Router();
const authController = require("../Controllers/Auth");
const dashboardController =require("../Controllers/Dashboard")
const Approval = require("../Controllers/Approval");
const Expenses = require("../Controllers/Expenses");
const Budget =require("../Controllers/Budget");
const Audit_Trail =require("../Controllers/Aduit");
const Report =require("../Controllers/Report");
const FormData =require("../Controllers/FromBuilder");
const User_Management =require("../Controllers/UserManagement");
const Setting =require("../Controllers/Setting")
const Branches = require("../Controllers/Branches");
const Approve_Type = require("../Controllers/Approve_Type");


// All Router Here:-
userRouter.get("/", authController.login);
userRouter.post("/login", authController.postLogin);
userRouter.get("/dashboard", dashboardController.dashboard);
userRouter.get("/approval", Approval.approval);
userRouter.get("/expenses", Expenses.expenses);
userRouter.get("/budget",Budget.budget)
userRouter.get("/audit",Audit_Trail.aduit);
userRouter.get("/report",Report.report);
userRouter.get("/fromBuilder",FormData.fromBuilder);
userRouter.get("/userManagement",User_Management.userManagement);
userRouter.get("/setting",Setting.setting);
userRouter.get("/branches", Branches.branches);
userRouter.get("/approve_type", Approve_Type.approve_type);
module.exports = userRouter;
