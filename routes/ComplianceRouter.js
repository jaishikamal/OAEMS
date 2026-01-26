"use strict";
const express = require("express");
const router = express.Router();
const ComplianceRisk = require("../Controllers/ComplianceRiskController");

// Page route
router.get("/ComplianceRisk", ComplianceRisk.complianceRiskManagement);

// Compliance Risk CRUD routes
router.post("/ComplianceRisk", ComplianceRisk.createComplianceRisk);
router.get("/ComplianceRisk/:id", ComplianceRisk.getComplianceRiskById);
router.post("/ComplianceRisk/:id", ComplianceRisk.updateComplianceRisk);
router.post("/ComplianceRisk/:id/delete", ComplianceRisk.deleteComplianceRisk);

module.exports = router;