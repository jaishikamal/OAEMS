const express = require("express");
const router = express.Router();
const Expenses_table= require("../Controllers/Expenses_tableController");

// Page route
router.get("/Expenses_table", Expenses_table.Expenses_tableManagement);

// Expenses tableZ CRUD routes
router.post("/Expenses_table", Expenses_table.createExpenses);
router.get("/Expenses_table/:id", Expenses_table.getExpensesById);
router.post("/Expenses_table/:id", Expenses_table.updateExpenses); // Changed to POST
router.post(
  "/Expenses_table/:id/delete",
  Expenses_table.deleteExpenses
); // Changed to POST with /delete

module.exports = router;
