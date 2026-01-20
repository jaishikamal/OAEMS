const { AccountCodeGroup } = require("../models");

// Account Code Group Management page
exports.AccountCodeGroupManagement = async (req, res) => {
  try {
    const accountGroupData = await AccountCodeGroup.findAll({
      raw: true,
      order: [["code", "ASC"]], // Order by code for logical sequence
    });

    // Check if this is the first entry
    const isFirstEntry = accountGroupData.length === 0;

    res.render("pages/AccountCodeGroup", {
      pageTitle: "Account Code Group Management",
      layout: "main",
      accountGroupData: accountGroupData,
      isFirstEntry: isFirstEntry,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error fetching account code groups:", error);
    res.status(500).render("pages/AccountCodeGroup", {
      pageTitle: "Account Code Group Management",
      layout: "main",
      accountGroupData: [],
      isFirstEntry: true,
      error: "Failed to load account code groups",
    });
  }
};

// Helper function to validate 3-digit code
const isValidCode = (code) => {
  const codeStr = code.toString();
  return /^\d{3}$/.test(codeStr) && parseInt(codeStr) >= 100 && parseInt(codeStr) <= 999;
};

// Helper function to generate next sequential code
const generateNextCode = async () => {
  try {
    // Find the highest existing code
    const lastGroup = await AccountCodeGroup.findOne({
      order: [["code", "DESC"]],
      attributes: ["code"],
    });

    if (!lastGroup) {
      // This shouldn't happen as we check count before calling this
      throw new Error("No existing codes found. First code must be user-defined.");
    }

    const lastCode = parseInt(lastGroup.code);
    const nextCode = lastCode + 1;

    // Ensure we stay within 3-digit range
    if (nextCode > 999) {
      throw new Error("Maximum code limit (999) reached. Cannot create more groups.");
    }

    return nextCode.toString().padStart(3, "0");
  } catch (error) {
    throw error;
  }
};

// Helper function to find next available code if requested code is taken
const findAvailableCode = async (requestedCode, excludeId = null) => {
  // First, check if requested code is available
  const whereClause = { code: requestedCode };
  if (excludeId) {
    whereClause.id = { [require("sequelize").Op.ne]: excludeId };
  }
  
  const existing = await AccountCodeGroup.findOne({ where: whereClause });
  
  if (!existing) {
    return requestedCode; // Requested code is available
  }

  // Requested code is taken, find next available
  const allCodes = await AccountCodeGroup.findAll({
    attributes: ["code"],
    order: [["code", "ASC"]],
    raw: true,
  });

  const usedCodes = new Set(allCodes.map(g => parseInt(g.code)));
  
  // Start from requested code and find next available
  let nextCode = parseInt(requestedCode);
  while (nextCode <= 999) {
    if (!usedCodes.has(nextCode)) {
      return nextCode.toString().padStart(3, "0");
    }
    nextCode++;
  }

  // If no code available after requested, search from 100
  for (let code = 100; code < parseInt(requestedCode); code++) {
    if (!usedCodes.has(code)) {
      return code.toString().padStart(3, "0");
    }
  }

  throw new Error("No available codes found in range 100-999");
};

// Create account code group
exports.createAccountCodeGroup = async (req, res) => {
  try {
    const { code, description, status } = req.body;

    // Validate description
    if (!description || description.trim() === "") {
      return res.redirect("/AccountCodeGroup?error=Description is required");
    }

    // Check if this is the first entry
    const existingCount = await AccountCodeGroup.count();
    let finalCode;

    if (existingCount === 0) {
      // First entry - user must provide code
      if (!code || code.trim() === "") {
        return res.redirect("/AccountCodeGroup?error=Code is required for the first entry");
      }

      const userCode = code.trim();

      // Validate 3-digit format
      if (!isValidCode(userCode)) {
        return res.redirect("/AccountCodeGroup?error=Code must be exactly 3 digits (100-999)");
      }

      finalCode = userCode.padStart(3, "0");
    } else {
      // Subsequent entries - system generates code
      try {
        finalCode = await generateNextCode();
      } catch (error) {
        return res.redirect("/AccountCodeGroup?error=" + error.message);
      }
    }

    // Check for duplicate code (extra safety)
    const existing = await AccountCodeGroup.findOne({ where: { code: finalCode } });
    if (existing) {
      return res.redirect("/AccountCodeGroup?error=Code already exists");
    }

    // Create the account code group
    await AccountCodeGroup.create({
      code: finalCode,
      description: description.trim(),
      status: status === "true" || status === "1" ? true : false,
    });

    res.redirect(
      "/AccountCodeGroup?success=Account code group created successfully with code: " + finalCode
    );
  } catch (error) {
    console.error("Error creating account code group:", error);
    res.redirect("/AccountCodeGroup?error=Failed to create account code group");
  }
};

// Get account code group by ID (API endpoint)
exports.getAccountCodeGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const accountCodeGroup = await AccountCodeGroup.findByPk(id);

    if (!accountCodeGroup) {
      return res.status(404).json({
        success: false,
        message: "Account code group not found",
      });
    }

    res.status(200).json({
      success: true,
      data: accountCodeGroup,
    });
  } catch (error) {
    console.error("Error fetching account code group:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update account code group
exports.updateAccountCodeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, status } = req.body;

    // Validate required fields
    if (!description || description.trim() === "") {
      return res.redirect("/AccountCodeGroup?error=Description is required");
    }

    if (!code || code.trim() === "") {
      return res.redirect("/AccountCodeGroup?error=Code is required");
    }

    const accountCodeGroup = await AccountCodeGroup.findByPk(id);

    if (!accountCodeGroup) {
      return res.redirect("/AccountCodeGroup?error=Account code group not found");
    }

    const requestedCode = code.trim().padStart(3, "0");

    // Validate 3-digit format
    if (!isValidCode(requestedCode)) {
      return res.redirect("/AccountCodeGroup?error=Code must be exactly 3 digits (100-999)");
    }

    let finalCode = requestedCode;
    let codeChanged = false;

    // Check if code is different from current code
    if (requestedCode !== accountCodeGroup.code) {
      // Check if requested code already exists (excluding current record)
      const existing = await AccountCodeGroup.findOne({
        where: {
          code: requestedCode,
          id: { [require("sequelize").Op.ne]: id }
        }
      });

      if (existing) {
        // Code exists, find next available code
        try {
          finalCode = await findAvailableCode(requestedCode, id);
          codeChanged = true;
        } catch (error) {
          return res.redirect("/AccountCodeGroup?error=" + error.message);
        }
      }
    }

    // Update the account code group
    await accountCodeGroup.update({
      code: finalCode,
      description: description.trim(),
      status: status === "1" || status === 1 ? true : false,
    });

    let successMessage = "Account code group updated successfully";
    if (codeChanged) {
      successMessage += `. Code ${requestedCode} was already in use, assigned code ${finalCode} instead`;
    } else if (finalCode !== accountCodeGroup.code) {
      successMessage += ` with new code: ${finalCode}`;
    }

    res.redirect("/AccountCodeGroup?success=" + successMessage);
  } catch (error) {
    console.error("Error updating account code group:", error);
    res.redirect("/AccountCodeGroup?error=Failed to update account code group");
  }
};

// Delete account code group
exports.deleteAccountCodeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const accountCodeGroup = await AccountCodeGroup.findByPk(id);

    if (!accountCodeGroup) {
      return res.redirect("/AccountCodeGroup?error=Account code group not found");
    }

    await accountCodeGroup.destroy();
    res.redirect("/AccountCodeGroup?success=Account code group deleted successfully");
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/AccountCodeGroup?error=Cannot delete: Group is used in other records"
      );
    }
    console.error("Error deleting account code group:", error);
    res.redirect("/AccountCodeGroup?error=Failed to delete account code group");
  }
};