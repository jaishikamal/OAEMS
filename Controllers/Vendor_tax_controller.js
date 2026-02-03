const { VendorTaxDetail, Vendor_Identification } = require("../Models");
const { Op } = require("sequelize");

// main page
exports.index = async (req, res) => {
  try {
    // First, get all tax details
    const vendorTaxDetails = await VendorTaxDetail.findAll({
      include: [
        {
          model: Vendor_Identification,
          as: "vendor",
          attributes: ["id", "vendorId", "tradeName", "vendorType"],
          required: false, // LEFT JOIN instead of INNER JOIN
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Get vendors without tax details - FIXED QUERY
    const allVendors = await Vendor_Identification.findAll({
      attributes: ["id", "vendorId", "tradeName", "vendorType"],
      where: {
        status: "Active",
      },
      order: [["tradeName", "ASC"]],
      raw: false, // Important: don't use raw mode with includes
    });

    // Filter vendors that don't have tax details yet
    const existingVendorIds = vendorTaxDetails.map((tax) => tax.vendor_id);
    const availableVendors = allVendors.filter(
      (vendor) => !existingVendorIds.includes(vendor.id),
    );

    console.log("Available vendors count:", availableVendors.length); // Debug log

    res.render("pages/Vendor_tax_details", {
      // lowercase
      title: "Vendor Tax Details Management",
      vendorTaxDetails,
      allVendors,
      availableVendors,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Error fetching vendor tax details:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Stack trace:", error.stack);

    req.flash("error", "Failed to fetch vendor tax details: " + error.message);
    res.redirect("/");
  }
};
// Create new vendor tax detail
exports.create = async (req, res) => {
  try {
    const {
      vendor_id,
      pan_number,
      pan_holder_name,
      vat_registered,
      tds_applicable,
      tds_rate,
    } = req.body;

    // Check if vendor already has tax details
    const existingTaxDetail = await VendorTaxDetail.findOne({
      where: { vendor_id },
    });

    if (existingTaxDetail) {
      req.flash("error", "Tax details already exist for this vendor");
      return res.redirect("/vendor-tax-details");
    }

    // Check if PAN number already exists
    const existingPAN = await VendorTaxDetail.findOne({
      where: { pan_number },
    });

    if (existingPAN) {
      req.flash("error", "PAN number already exists");
      return res.redirect("/vendor-tax-details");
    }

    // Prepare data
    const taxData = {
      vendor_id,
      pan_number: pan_number.replace(/\D/g, ""),
      pan_holder_name: pan_holder_name.trim().toUpperCase(),
      vat_registered: vat_registered === "on" || vat_registered === "true",
      tds_applicable: tds_applicable === "on" || tds_applicable === "true",
    };

    // Auto-set VAT number if VAT registered
    if (taxData.vat_registered) {
      taxData.vat_number = taxData.pan_number;
      taxData.vat_rate = 13.0;
    }

    // Set TDS rate if applicable
    if (taxData.tds_applicable && tds_rate) {
      taxData.tds_rate = parseFloat(tds_rate);
    }

    // Create tax detail
    await VendorTaxDetail.create(taxData);

    req.flash("success", "Vendor tax details created successfully");
    res.redirect("/vendor-tax-details");
  } catch (error) {
    console.error("Error creating vendor tax detail:", error);

    if (error.name === "SequelizeValidationError") {
      const errorMessages = error.errors.map((e) => e.message).join(", ");
      req.flash("error", errorMessages);
    } else {
      req.flash(
        "error",
        error.message || "Failed to create vendor tax details",
      );
    }

    res.redirect("/vendor-tax-details");
  }
};

// Update vendor tax detail
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { pan_holder_name, vat_registered, tds_applicable, tds_rate } =
      req.body;

    const taxDetail = await VendorTaxDetail.findByPk(id);

    if (!taxDetail) {
      req.flash("error", "Vendor tax detail not found");
      return res.redirect("/vendor-tax-details");
    }

    // Prepare update data
    const updateData = {
      pan_holder_name: pan_holder_name.trim().toUpperCase(),
      vat_registered:
        vat_registered === "on" ||
        vat_registered === "true" ||
        vat_registered === "1",
      tds_applicable:
        tds_applicable === "on" ||
        tds_applicable === "true" ||
        tds_applicable === "1",
    };

    // Handle VAT registration changes
    if (updateData.vat_registered) {
      updateData.vat_number = taxDetail.pan_number;
      updateData.vat_rate = 13.0;
    } else {
      updateData.vat_number = null;
      updateData.vat_rate = null;
    }

    // Handle TDS changes
    if (updateData.tds_applicable && tds_rate) {
      updateData.tds_rate = parseFloat(tds_rate);
    } else {
      updateData.tds_rate = null;
    }

    // Update tax detail
    await taxDetail.update(updateData);

    req.flash("success", "Vendor tax details updated successfully");
    res.redirect("/vendor-tax-details");
  } catch (error) {
    console.error("Error updating vendor tax detail:", error);

    if (error.name === "SequelizeValidationError") {
      const errorMessages = error.errors.map((e) => e.message).join(", ");
      req.flash("error", errorMessages);
    } else {
      req.flash(
        "error",
        error.message || "Failed to update vendor tax details",
      );
    }

    res.redirect("/vendor-tax-details");
  }
};

// Delete vendor tax detail
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const taxDetail = await VendorTaxDetail.findByPk(id);

    if (!taxDetail) {
      req.flash("error", "Vendor tax detail not found");
      return res.redirect("/vendor-tax-details");
    }

    await taxDetail.destroy();

    req.flash("success", "Vendor tax details deleted successfully");
    res.redirect("/vendor-tax-details");
  } catch (error) {
    console.error("Error deleting vendor tax detail:", error);
    req.flash("error", "Failed to delete vendor tax details");
    res.redirect("/vendor-tax-details");
  }
};

// Validate PAN number (AJAX endpoint)
exports.validatePAN = async (req, res) => {
  try {
    const { pan_number, vendor_tax_id } = req.query;

    // Remove non-digits
    const cleanPAN = pan_number.replace(/\D/g, "");

    // Check PAN format
    if (cleanPAN.length !== 9) {
      return res.json({
        valid: false,
        message: "PAN number must be exactly 9 digits",
      });
    }

    // Check if PAN already exists
    const whereClause = { pan_number: cleanPAN };
    if (vendor_tax_id) {
      whereClause.id = { [Op.ne]: vendor_tax_id };
    }

    const existingPAN = await VendorTaxDetail.findOne({ where: whereClause });

    res.json({
      valid: !existingPAN,
      message: existingPAN
        ? "PAN number already exists"
        : "PAN number is available",
      cleanPAN,
    });
  } catch (error) {
    console.error("Error validating PAN:", error);
    res.status(500).json({
      valid: false,
      message: "Validation error",
    });
  }
};
// Toggle active status
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const taxDetail = await VendorTaxDetail.findByPk(id);

    if (!taxDetail) {
      req.flash("error", "Vendor tax detail not found");
      return res.redirect("/vendor-tax-details");
    }

    await taxDetail.update({
      is_active: !taxDetail.is_active,
      updated_by: req.user ? req.user.id : null,
    });

    req.flash(
      "success",
      `Tax details ${taxDetail.is_active ? "activated" : "deactivated"} successfully`,
    );
    res.redirect("/vendor-tax-details");
  } catch (error) {
    console.error("Error toggling status:", error);
    req.flash("error", "Failed to update status");
    res.redirect("/vendor-tax-details");
  }
};
