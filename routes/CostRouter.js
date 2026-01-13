const express = require("express");
const router = express.Router();
const Cost_Center = require("../Controllers/CostCenterController");

//page route
router.get("/CostCenter", Cost_Center.CostCenterManagement);

//  cost center curd routes
router.post("/cost-centers", Cost_Center.createCostCenter);
router.get("/cost-centers", Cost_Center.getAllCostCenters);
router.get("/cost-centers/:id", Cost_Center.getCostCenterById);
router.put("/cost-centers/:id", Cost_Center.updateCostCenter);
router.delete("/cost-centers/:id", Cost_Center.deleteCostCenter);

module.exports = router;
