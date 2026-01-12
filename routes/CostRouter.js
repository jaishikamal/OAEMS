const express = require("express");
const router = express.Router();
const controller = require("../Controllers/CostCenterController");

// cost center routes
router.post("/cost-centers", controller.createCostCenter);
router.get("/cost-centers", controller.getAllCostCenters);
router.get("/cost-centers/:id", controller.getCostCenterById);
router.put("/cost-centers/:id", controller.updateCostCenter);
router.delete("/cost-centers/:id", controller.deleteCostCenter);

module.exports = router;
