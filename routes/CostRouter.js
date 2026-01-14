const express = require("express");
const router = express.Router();
const Cost_Center = require("../Controllers/CostCenterController");

// Page route
router.get("/CostCenter", Cost_Center.CostCenterManagement);

// Cost center CRUD routes
router.post("/cost-centers", Cost_Center.createCostCenter);
router.get("/cost-centers/:id", Cost_Center.getCostCenterById);
router.post("/cost-centers/:id", Cost_Center.updateCostCenter); // Changed to POST
router.post("/cost-centers/:id/delete", Cost_Center.deleteCostCenter); // Changed to POST with /delete

module.exports = router;
