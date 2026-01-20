const express = require("express");
const router = express.Router();
const coaController = require("../Controllers/COAController");

// API endpoints - MUST come before dynamic routes
router.get("/ChartOfAccounts/check-combination", coaController.checkCOACombination);
router.get("/ChartOfAccounts/expense-heads", coaController.getExpenseHeadsByGroup);

// Chart of Accounts routes
router.get("/ChartOfAccounts", coaController.ChartOfAccountsManagement);
router.post("/ChartOfAccounts", coaController.createChartOfAccounts);
router.post("/ChartOfAccounts/:id", coaController.updateChartOfAccounts);
router.post("/ChartOfAccounts/:id/delete", coaController.deleteChartOfAccounts);

// Dynamic route - MUST be last
router.get("/ChartOfAccounts/:id", coaController.getChartOfAccountsById);

module.exports = router;