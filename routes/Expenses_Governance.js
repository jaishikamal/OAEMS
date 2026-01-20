const express =require("express");
const router = express.Router();
const Expenses_Governance = require("../Controllers/Expenses_GovernanceController");

//  page route
router.get("/ExpensesGovernance", Expenses_Governance.Expenses_GovernanceManagement);


// Expenses Governance CRUD routes
router.post("/ExpensesGovernance", Expenses_Governance.createExpenses_Governance);
router.get("/ExpensesGovernance/:id", Expenses_Governance.getExpenses_GovernanceById);
router.post("/ExpensesGovernance/:id", Expenses_Governance.updateExpenses_Governance); // Changed to POST
router.post("/ExpensesGovernance/:id/delete", Expenses_Governance.deleteExpenses_Governance); // Changed to POST with /delete

module.exports = router;