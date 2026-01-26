const express = require("express");
const router = express.Router();
const vendorTaxDetailController = require("../controllers/vendor_tax_controller");

// IMPORTANT: Put specific routes BEFORE parameterized routes to avoid conflicts

// AJAX routes (must come first)
router.get("/validate-pan", vendorTaxDetailController.validatePAN);

// Main page route
router.get("/", vendorTaxDetailController.index);

// Create new vendor tax detail
router.post("/", vendorTaxDetailController.create);

// Parameterized routes (must come after specific routes) 
router.post("/:id", vendorTaxDetailController.update);
router.post("/:id/delete", vendorTaxDetailController.delete);
router.post("/:id/toggle-status", vendorTaxDetailController.toggleStatus);

module.exports = router;
