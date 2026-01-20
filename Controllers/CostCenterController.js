const { CostCenter } = require("../models");

// Cost Center Management page
exports.CostCenterManagement = async (req, res) => {
  try {
    const costdata = await CostCenter.findAll({
      raw: true,
      order: [["createdAt", "DESC"]],
    });

    res.render("pages/CostCenter", {
      pageTitle: "Cost Center Management",
      layout: "main",
      costdata: costdata,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    res.status(500).render("pages/CostCenter", {
      pageTitle: "Cost Center Management",
      layout: "main",
      costdata: [],
      error: "Failed to load cost centers",
    });
  }
};

// Create cost center
exports.createCostCenter = async (req, res) => {
  try {
    const { code, title, status } = req.body;

    // Validate required fields
    if (!code || !title) {
      return res.redirect("/CostCenter?error=Code and Title are required");
    }

    // Validate code format (must be 3 digits)
    if (!/^\d{3}$/.test(code)) {
      return res.redirect("/CostCenter?error=Code must be exactly 3 digits");
    }

    // Check if code already exists
    const existing = await CostCenter.findOne({ where: { code: code.trim() } });
    if (existing) {
      return res.redirect("/CostCenter?error=Code already exists");
    }

    await CostCenter.create({
      code: code.trim(),
      title: title.trim(),
      status: status === "1" || status === 1 || status === true ? 1 : 0,
    });

    res.redirect(
      "/CostCenter?success=Cost center created successfully with code: " + code,
    );
  } catch (error) {
    console.error("Error creating cost center:", error);
    res.redirect("/CostCenter?error=Failed to create cost center");
  }
};

// Get cost center by ID (API endpoint)
exports.getCostCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const costCenter = await CostCenter.findByPk(id);

    if (!costCenter) {
      return res.status(404).json({
        success: false,
        message: "Cost center not found",
      });
    }

    res.status(200).json({
      success: true,
      data: costCenter,
    });
  } catch (error) {
    console.error("Error fetching cost center:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update cost center
exports.updateCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, status } = req.body;

    // Validate required fields
    if (!code || !title) {
      return res.redirect("/CostCenter?error=Code and Title are required");
    }

    // Validate code format (must be 3 digits)
    if (!/^\d{3}$/.test(code)) {
      return res.redirect("/CostCenter?error=Code must be exactly 3 digits");
    }

    const costCenter = await CostCenter.findByPk(id);

    if (!costCenter) {
      return res.redirect("/CostCenter?error=Cost center not found");
    }

    // Check if code is already used by another cost center
    const { Op } = require("sequelize");
    const existing = await CostCenter.findOne({
      where: {
        code: code.trim(),
        id: { [Op.ne]: id }
      }
    });

    if (existing) {
      return res.redirect("/CostCenter?error=Code already exists");
    }

    await costCenter.update({
      code: code.trim(),
      title: title.trim(),
      status: status === "1" || status === 1 || status === true ? 1 : 0,
    });

    res.redirect("/CostCenter?success=Cost center updated successfully");
  } catch (error) {
    console.error("Error updating cost center:", error);
    res.redirect("/CostCenter?error=Failed to update cost center");
  }
};

// Delete cost center
exports.deleteCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const costCenter = await CostCenter.findByPk(id);

    if (!costCenter) {
      return res.redirect("/CostCenter?error=Cost center not found");
    }

    await costCenter.destroy();
    res.redirect("/CostCenter?success=Cost center deleted successfully");
  } catch (error) {
    console.error("Error deleting cost center:", error);
    res.redirect("/CostCenter?error=Failed to delete cost center");
  }
};