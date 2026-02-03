const { CostCenter } = require("../Models");
const { Op } = require("sequelize");

// Cost Center Type Configuration
const COST_CENTER_TYPES = {
  HEAD_OFFICE: {
    label: "Head Office/Corporate Office",
    codeRange: { min: 999, max: 999 },
  },
  PROVINCE_OFFICE: {
    label: "Province Office",
    codeRange: { min: 992, max: 998 },
  },
  BRANCH: {
    label: "Branch",
    codeRange: { min: 1, max: 300 },
  },
  EXTENSION_COUNTER: {
    label: "Extension Counter",
    codeRange: { min: 301, max: 500 },
  },
};

// Helper function to pad code to 3 digits
const padCode = (code) => {
  return code.toString().padStart(3, "0");
};

// Generate next available code for a type
const generateNextCode = async (type) => {
  const typeConfig = COST_CENTER_TYPES[type];

  if (!typeConfig) {
    throw new Error("Invalid cost center type");
  }

  const { min, max } = typeConfig.codeRange;

  // Special case for HEAD_OFFICE (fixed code 999)
  if (type === "HEAD_OFFICE") {
    const existing = await CostCenter.findOne({ where: { code: "999" } });
    if (existing) {
      throw new Error("Head Office cost center already exists with code 999");
    }
    return "999";
  }

  // Find all existing codes in this range
  const existingCodes = await CostCenter.findAll({
    where: {
      code: {
        [Op.between]: [padCode(min), padCode(max)],
      },
    },
    attributes: ["code"],
    raw: true,
  });

  const usedCodes = new Set(existingCodes.map((c) => parseInt(c.code, 10)));

  // Find first available code in range
  for (let code = min; code <= max; code++) {
    if (!usedCodes.has(code)) {
      return padCode(code);
    }
  }

  throw new Error(
    `No available codes for ${typeConfig.label}. Range ${padCode(min)}-${padCode(max)} is full.`,
  );
};

// Validate code is within correct range for type
const validateCodeForType = (code, type) => {
  const typeConfig = COST_CENTER_TYPES[type];
  if (!typeConfig) {
    return { valid: false, message: "Invalid cost center type" };
  }

  const numericCode = parseInt(code, 10);
  const { min, max } = typeConfig.codeRange;

  if (isNaN(numericCode)) {
    return { valid: false, message: "Code must be numeric" };
  }

  if (numericCode < min || numericCode > max) {
    return {
      valid: false,
      message: `Code ${code} is outside valid range ${padCode(min)}-${padCode(max)} for ${typeConfig.label}`,
    };
  }

  if (code.length !== 3) {
    return { valid: false, message: "Code must be exactly 3 digits" };
  }

  return { valid: true };
};

// Cost Center Management page
exports.CostCenterManagement = async (req, res) => {
  try {
    const costdata = await CostCenter.findAll({
      raw: true,
      order: [["code", "ASC"]],
    });

    res.render("pages/CostCenter", {
      pageTitle: "Cost Center Management",
      layout: "main",
      costdata: costdata,
      costCenterTypes: COST_CENTER_TYPES,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error fetching cost centers:", error);
    res.status(500).render("pages/CostCenter", {
      pageTitle: "Cost Center Management",
      layout: "main",
      costdata: [],
      costCenterTypes: COST_CENTER_TYPES,
      error: "Failed to load cost centers",
    });
  }
};

// Create cost center
exports.createCostCenter = async (req, res) => {
  try {
    const { title, type, status } = req.body;

    // Validate required fields
    if (!title || !type) {
      return res.redirect("/CostCenter?error=Title and Type are required");
    }

    // Validate type
    if (!COST_CENTER_TYPES[type]) {
      return res.redirect("/CostCenter?error=Invalid cost center type");
    }

    // Auto-generate code based on type
    const code = await generateNextCode(type);

    await CostCenter.create({
      code: code,
      title: title.trim(),
      type: type,
      status: status === "1" || status === 1 || status === true ? 1 : 0,
    });

    res.redirect(
      `/CostCenter?success=Cost center created successfully with code: ${code}`,
    );
  } catch (error) {
    console.error("Error creating cost center:", error);
    res.redirect(
      `/CostCenter?error=${encodeURIComponent(error.message || "Failed to create cost center")}`,
    );
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
    const { code, title, type, status } = req.body;

    // Validate required fields
    if (!code || !title || !type) {
      return res.redirect(
        "/CostCenter?error=Code, Title, and Type are required",
      );
    }

    const costCenter = await CostCenter.findByPk(id);

    if (!costCenter) {
      return res.redirect("/CostCenter?error=Cost center not found");
    }

    // Validate type
    if (!COST_CENTER_TYPES[type]) {
      return res.redirect("/CostCenter?error=Invalid cost center type");
    }

    // Validate code format and range
    const validation = validateCodeForType(code, type);
    if (!validation.valid) {
      return res.redirect(
        `/CostCenter?error=${encodeURIComponent(validation.message)}`,
      );
    }

    // Check if code is already used by another cost center
    if (code !== costCenter.code) {
      const existing = await CostCenter.findOne({
        where: {
          code: code.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        return res.redirect("/CostCenter?error=Code already exists");
      }
    }

    // Special check for HEAD_OFFICE - only one allowed
    if (type === "HEAD_OFFICE" && costCenter.type !== "HEAD_OFFICE") {
      const headOfficeExists = await CostCenter.findOne({
        where: {
          type: "HEAD_OFFICE",
          id: { [Op.ne]: id },
        },
      });
      if (headOfficeExists) {
        return res.redirect(
          "/CostCenter?error=Head Office cost center already exists",
        );
      }
    }

    await costCenter.update({
      code: code.trim(),
      title: title.trim(),
      type: type,
      status: status === "1" || status === 1 || status === true ? 1 : 0,
    });

    res.redirect("/CostCenter?success=Cost center updated successfully");
  } catch (error) {
    console.error("Error updating cost center:", error);
    res.redirect(
      `/CostCenter?error=${encodeURIComponent(error.message || "Failed to update cost center")}`,
    );
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
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/CostCenter?error=Cannot delete: This cost center is referenced in other records",
      );
    }
    console.error("Error deleting cost center:", error);
    res.redirect("/CostCenter?error=Failed to delete cost center");
  }
};

// API endpoint to get next available code preview
exports.getNextAvailableCode = async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type is required",
      });
    }

    const code = await generateNextCode(type);

    res.status(200).json({
      success: true,
      code: code,
      typeConfig: COST_CENTER_TYPES[type],
    });
  } catch (error) {
    console.error("Error generating code preview:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
