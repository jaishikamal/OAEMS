const express = require("express");
const router = express.Router();
const Expenses_head = require("../Controllers/Expenses_headController");

// // Page route
router.get("/Expenses_head", Expenses_head.Expenses_headManagement);

// // Expenses head CRUD routes
router.post("/Expenses_head", Expenses_head.createExpenses_head);
router.get("/Expenses_head/:id", Expenses_head.getExpenses_headById);
router.post("/Expenses_head/:id", Expenses_head.updateExpenses_head); // Changed to POST
router.post("/Expenses_head/:id/delete", Expenses_head.deleteExpenses_head); 
// Changed to POST with /delete
router.get('/Expenses_head/check-code', Expenses_head.checkAccountGroupCode);
module.exports = router;
