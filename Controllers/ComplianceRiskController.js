"use strict";
const { ComplianceRisk } = require("../Models");

exports.complianceRiskManagement = async (req, res) => {
  try {
    const complianceRisks = await ComplianceRisk.findAll({
      order: [["id", "DESC"]],
    });

    res.render("pages/ComplianceRisk", {
      pageTitle: "Compliance and Risk Management",
      layout: "main",
      complianceRisks,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error(error);
    res.render("pages/ComplianceRisk", {
      complianceRisks: [],
      error: "Failed to load data",
    });
  }
};

// Create compliance risk
exports.createComplianceRisk = async (req, res) => {
  try {
    const {
      vendorRiskCategory,
      relatedParty,
      governmentVendor,
      blacklisted,
      remarks,
    } = req.body;

    // Validate required fields
    if (!vendorRiskCategory) {
      return res.redirect(
        "/ComplianceRisk?error=Vendor Risk Category is required",
      );
    }

    // Convert string to boolean
    const isRelatedParty = relatedParty === "true" || relatedParty === "1";
    const isGovernmentVendor =
      governmentVendor === "true" || governmentVendor === "1";
    const isBlacklisted = blacklisted === "true" || blacklisted === "1";

    // Validate conditional field - remarks required if blacklisted
    if (isBlacklisted && (!remarks || !remarks.trim())) {
      return res.redirect(
        "/ComplianceRisk?error=Remarks are required for blacklisted vendors",
      );
    }

    await ComplianceRisk.create({
      vendorRiskCategory,
      relatedParty: isRelatedParty,
      governmentVendor: isGovernmentVendor,
      blacklisted: isBlacklisted,
      remarks: remarks?.trim() || null,
    });

    res.redirect(
      "/ComplianceRisk?success=Compliance and Risk record created successfully",
    );
  } catch (error) {
    console.error("Error creating compliance risk:", error);
    res.redirect(
      "/ComplianceRisk?error=" +
        (error.message || "Failed to create compliance risk record"),
    );
  }
};

// Get compliance risk by ID (API endpoint)
exports.getComplianceRiskById = async (req, res) => {
  try {
    const { id } = req.params;
    const complianceRisk = await ComplianceRisk.findByPk(id);

    if (!complianceRisk) {
      return res.status(404).json({
        success: false,
        message: "Compliance and Risk record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: complianceRisk,
    });
  } catch (error) {
    console.error("Error fetching compliance risk:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update compliance risk
exports.updateComplianceRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vendorRiskCategory,
      relatedParty,
      governmentVendor,
      blacklisted,
      remarks,
    } = req.body;

    // Validate required fields
    if (!vendorRiskCategory) {
      return res.redirect(
        "/ComplianceRisk?error=Vendor Risk Category is required",
      );
    }

    const complianceRisk = await ComplianceRisk.findByPk(id);

    if (!complianceRisk) {
      return res.redirect(
        "/ComplianceRisk?error=Compliance and Risk record not found",
      );
    }

    // Convert string to boolean
    const isRelatedParty = relatedParty === "1" || relatedParty === 1;
    const isGovernmentVendor =
      governmentVendor === "1" || governmentVendor === 1;
    const isBlacklisted = blacklisted === "1" || blacklisted === 1;

    // Validate conditional field - remarks required if blacklisted
    if (isBlacklisted && (!remarks || !remarks.trim())) {
      return res.redirect(
        "/ComplianceRisk?error=Remarks are required for blacklisted vendors",
      );
    }

    await complianceRisk.update({
      vendorRiskCategory,
      relatedParty: isRelatedParty,
      governmentVendor: isGovernmentVendor,
      blacklisted: isBlacklisted,
      remarks: remarks?.trim() || null,
    });

    res.redirect(
      "/ComplianceRisk?success=Compliance and Risk record updated successfully",
    );
  } catch (error) {
    console.error("Error updating compliance risk:", error);
    res.redirect(
      "/ComplianceRisk?error=Failed to update compliance risk record",
    );
  }
};

// Delete compliance risk
exports.deleteComplianceRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const complianceRisk = await ComplianceRisk.findByPk(id);

    if (!complianceRisk) {
      return res.redirect(
        "/ComplianceRisk?error=Compliance and Risk record not found",
      );
    }

    await complianceRisk.destroy();
    res.redirect(
      "/ComplianceRisk?success=Compliance and Risk record deleted successfully",
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/ComplianceRisk?error=Cannot delete: Compliance record is used in other records",
      );
    }
    console.error("Error deleting compliance risk:", error);
    res.redirect(
      "/ComplianceRisk?error=Failed to delete compliance risk record",
    );
  }
};
