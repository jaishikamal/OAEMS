const express = require("express");
const router = express.Router();
const vendorController = require("../Controllers/Vendor_Master_Management");

// Get all vendors (page render)
router.get("/Vendor", vendorController.getAllVendors);

// Get all auto-generated vendor IDs (API)
router.get("/Vendor/generate-vendor-id", vendorController.generatedVendorID);

// Create vendor
router.post("/Vendor", vendorController.createVendor);

// Update vendor
router.post("/Vendor/:id", vendorController.updateVendor);

// Delete vendor
router.post("/Vendor/:id/delete", vendorController.deleteVendor);

// Get vendors by status (API)
router.get("/Vendor/status/:status", vendorController.getVendorsByStatus);

// Get vendors by type (API)
router.get("/Vendor/type/:vendorType", vendorController.getVendorsByType);

// Get vendors by category (API)
router.get("/Vendor/category/:vendorCategory", vendorController.getVendorsByCategory);

// Update vendor status (API)
router.post("/Vendor/:id/status", vendorController.updateVendorStatus);

module.exports = router;