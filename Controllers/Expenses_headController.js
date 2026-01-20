const { Expenses_heads, AccountCodeGroup } = require("../models");

exports.Expenses_headManagement = async (req, res) => {
  try {
    const expensesHeads = await Expenses_heads.findAll({
      include: [
        {
          model: AccountCodeGroup,
          as: "accountCodeGroup",
        },
      ],
      order: [["id", "DESC"]],
    });

    const accountCodeGroups = await AccountCodeGroup.findAll({
      where: { status: true },
      order: [["description", "ASC"]],
    });

    res.render("pages/Expenses_head", {
      pageTitle: "Expenses Head Management",
      layout: "main",
      expensesHeads,
      accountCodeGroups,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error(error);
    res.render("pages/Expenses_head", {
      expensesHeads: [],
      accountCodeGroups: [],
      error: "Failed to load data",
    });
  }
};

// Helper function to get next code for an account group
const getNextCodeForGroup = async (account_code_groups_id) => {
  // Find the highest code for this account group
  const lastExpense = await Expenses_heads.findOne({
    where: { account_code_groups_id },
    order: [["code", "DESC"]],
  });

  if (!lastExpense) {
    // No expenses for this group yet, return null (user must provide first code)
    return null;
  }

  // Increment the last code
  const lastCode = parseInt(lastExpense.code);
  const nextCode = lastCode + 1;

  // Validate it's still within 3-digit range
  if (nextCode > 999) {
    throw new Error("Code limit reached for this Account Group (max: 999)");
  }

  return nextCode.toString().padStart(3, "0");
};

// Validate 3-digit code
const validateCode = (code) => {
  const codeNum = parseInt(code);
  return code.length === 3 && codeNum >= 100 && codeNum <= 999 && !isNaN(codeNum);
};

// Create expenses head
exports.createExpenses_head = async (req, res) => {
  try {
    const { account_code_groups_id, code, title, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/Expenses_head?error=Title is required");
    }

    if (!account_code_groups_id) {
      return res.redirect(
        "/Expenses_head?error=Account Code Group is required",
      );
    }

    // Verify account code group exists
    const accountGroup = await AccountCodeGroup.findByPk(
      account_code_groups_id,
    );
    if (!accountGroup) {
      return res.redirect("/Expenses_head?error=Invalid Account Code Group");
    }

    // Get next code or validate provided code
    const nextCode = await getNextCodeForGroup(account_code_groups_id);

    let finalCode;
    if (nextCode === null) {
      // First entry for this group - user must provide code
      if (!code || !code.trim()) {
        return res.redirect(
          "/Expenses_head?error=Code is required for the first entry in this Account Group",
        );
      }

      const trimmedCode = code.trim();
      if (!validateCode(trimmedCode)) {
        return res.redirect(
          "/Expenses_head?error=Code must be exactly 3 digits (100-999)",
        );
      }

      // Check if code already exists
      const existingCode = await Expenses_heads.findOne({
        where: { code: trimmedCode },
      });
      if (existingCode) {
        return res.redirect("/Expenses_head?error=Code already exists");
      }

      finalCode = trimmedCode;
    } else {
      // Auto-increment for subsequent entries
      finalCode = nextCode;
    }

    await Expenses_heads.create({
      account_code_groups_id: account_code_groups_id,
      code: finalCode,
      title: title.trim(),
      status: status === "true" || status === "1" ? true : false,
    });

    res.redirect(
      "/Expenses_head?success=Expenses Head created successfully with code: " +
        finalCode,
    );
  } catch (error) {
    console.error("Error creating expenses head:", error);
    res.redirect(
      "/Expenses_head?error=" + (error.message || "Failed to create expenses head"),
    );
  }
};

// Get expenses head by ID (API endpoint)
exports.getExpenses_headById = async (req, res) => {
  try {
    const { id } = req.params;
    const expensesHead = await Expenses_heads.findByPk(id, {
      include: [
        {
          model: AccountCodeGroup,
          as: "accountCodeGroup",
        },
      ],
    });

    if (!expensesHead) {
      return res.status(404).json({
        success: false,
        message: "Expenses Head not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expensesHead,
    });
  } catch (error) {
    console.error("Error fetching expenses head:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Check if account group needs code input (API endpoint)
exports.checkAccountGroupCode = async (req, res) => {
  try {
    const { account_code_groups_id } = req.query;

    if (!account_code_groups_id) {
      return res.status(400).json({
        success: false,
        message: "Account Code Group ID is required",
      });
    }

    const nextCode = await getNextCodeForGroup(account_code_groups_id);

    res.status(200).json({
      success: true,
      requiresInput: nextCode === null,
      suggestedCode: nextCode,
    });
  } catch (error) {
    console.error("Error checking account group code:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update expenses head
exports.updateExpenses_head = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_code_groups_id, title, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/Expenses_head?error=Title is required");
    }

    if (!account_code_groups_id) {
      return res.redirect(
        "/Expenses_head?error=Account Code Group is required",
      );
    }

    const expensesHead = await Expenses_heads.findByPk(id);

    if (!expensesHead) {
      return res.redirect("/Expenses_head?error=Expenses Head not found");
    }

    // Verify account code group exists
    const accountGroup = await AccountCodeGroup.findByPk(
      account_code_groups_id,
    );
    if (!accountGroup) {
      return res.redirect("/Expenses_head?error=Invalid Account Code Group");
    }

    // Code cannot be changed, only title, account_code_groups_id and status
    await expensesHead.update({
      account_code_groups_id: account_code_groups_id,
      title: title.trim(),
      status: status === "1" || status === 1 ? true : false,
    });

    res.redirect("/Expenses_head?success=Expenses Head updated successfully");
  } catch (error) {
    console.error("Error updating expenses head:", error);
    res.redirect("/Expenses_head?error=Failed to update expenses head");
  }
};

// Delete expenses head
exports.deleteExpenses_head = async (req, res) => {
  try {
    const { id } = req.params;
    const expensesHead = await Expenses_heads.findByPk(id);

    if (!expensesHead) {
      return res.redirect("/Expenses_head?error=Expenses head not found");
    }

    await expensesHead.destroy();
    res.redirect("/Expenses_head?success=Expenses head deleted successfully");
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/Expenses_head?error=Cannot delete: Expenses head is used in other records",
      );
    }
    console.error("Error deleting expenses head:", error);
    res.redirect("/Expenses_head?error=Failed to delete expenses head");
  }
};