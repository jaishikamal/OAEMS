// routes/CostRouter.js
const express = require("express");
const router = express.Router();
const costController = require("../Controllers/CostCenterController");

// API endpoints - for fetching next available cost center code
router.get("/cost-centers/next-code", costController.getNextAvailableCode);

// Cost Center routes
router.get("/CostCenter", costController.CostCenterManagement);
router.post("/cost-centers", costController.createCostCenter);
router.get("/cost-centers/:id", costController.getCostCenterById);
router.post("/cost-centers/:id", costController.updateCostCenter);
router.post("/cost-centers/:id/delete", costController.deleteCostCenter);

module.exports = router;