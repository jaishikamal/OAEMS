const {
  ChartOfAccounts,
  AccountCodeGroup,
  Expenses_heads,
  CostCenter,
} = require("../Models");

// Chart of Accounts Management page
exports.ChartOfAccountsManagement = async (req, res) => {
  try {
    const chartOfAccounts = await ChartOfAccounts.findAll({
      include: [
        {
          model: AccountCodeGroup,
          as: "accountCodeGroup",
          attributes: ["id", "code", "description"],
        },
        {
          model: Expenses_heads,
          as: "expenseHead",
          attributes: ["id", "code", "title"],
        },
        {
          model: CostCenter,
          as: "costCenter",
          attributes: ["id", "code", "title"],
        },
      ],
      order: [["coa_code", "ASC"]],
    });

    // Get active dropdown options
    const accountCodeGroups = await AccountCodeGroup.findAll({
      where: { status: true },
      order: [["code", "ASC"]],
    });

    const expenseHeads = await Expenses_heads.findAll({
      where: { status: true },
      include: [
        {
          model: AccountCodeGroup,
          as: "accountCodeGroup",
          attributes: ["code"],
        },
      ],
      order: [["code", "ASC"]],
    });

    const costCenters = await CostCenter.findAll({
      where: { status: true },
      order: [["code", "ASC"]],
    });

    res.render("pages/Chart_of_Account", {
      pageTitle: "Chart of Accounts Management",
      layout: "main",
      chartOfAccounts,
      accountCodeGroups,
      expenseHeads,
      costCenters,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error fetching chart of accounts:", error);
    res.render("pages/Chart_of_Account", {
      pageTitle: "Chart of Accounts Management",
      layout: "main",
      chartOfAccounts: [],
      accountCodeGroups: [],
      expenseHeads: [],
      costCenters: [],
      error: "Failed to load data",
    });
  }
};

// Helper function to generate COA code (AAA+BBB+CCC)
const generateCOACode = async (accountGroupId, expenseHeadId, costCenterId) => {
  try {
    // Fetch the codes from each entity
    const accountGroup = await AccountCodeGroup.findByPk(accountGroupId);
    const expenseHead = await Expenses_heads.findByPk(expenseHeadId);
    const costCenter = await CostCenter.findByPk(costCenterId);

    if (!accountGroup || !expenseHead || !costCenter) {
      throw new Error("One or more selected entities not found");
    }

    // Combine codes: AAA + BBB + CCC (each is 3 digits)
    const coaCode = accountGroup.code + expenseHead.code + costCenter.code;

    // Validate 9-digit format
    if (coaCode.length !== 9) {
      throw new Error(
        "Invalid COA code generation. Each code must be exactly 3 digits.",
      );
    }

    return coaCode;
  } catch (error) {
    throw error;
  }
};

// Check if combination already exists (API endpoint)
exports.checkCOACombination = async (req, res) => {
  try {
    const { account_group_id, expense_head_id, cost_center_id } = req.query;

    if (!account_group_id || !expense_head_id || !cost_center_id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if combination exists
    const existing = await ChartOfAccounts.findOne({
      where: {
        account_group_id,
        expense_head_id,
        cost_center_id,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: false,
        exists: true,
        message: "This combination already exists",
        existingCode: existing.coa_code,
      });
    }

    // Generate preview of COA code
    const coaCode = await generateCOACode(
      account_group_id,
      expense_head_id,
      cost_center_id,
    );

    res.status(200).json({
      success: true,
      exists: false,
      previewCode: coaCode,
    });
  } catch (error) {
    console.error("Error checking COA combination:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get filtered expense heads by account group (API endpoint)
exports.getExpenseHeadsByGroup = async (req, res) => {
  try {
    const { account_group_id } = req.query;

    if (!account_group_id) {
      return res.status(400).json({
        success: false,
        message: "Account Group ID is required",
      });
    }

    const expenseHeads = await Expenses_heads.findAll({
      where: {
        account_code_groups_id: account_group_id,
        status: true,
      },
      order: [["code", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: expenseHeads,
    });
  } catch (error) {
    console.error("Error fetching expense heads:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create Chart of Accounts
exports.createChartOfAccounts = async (req, res) => {
  try {
    const { account_group_id, expense_head_id, cost_center_id, status } =
      req.body;

    // Validate required fields
    if (!account_group_id || !expense_head_id || !cost_center_id) {
      return res.redirect("/ChartOfAccounts?error=All fields are required");
    }

    // Check if combination already exists
    const existing = await ChartOfAccounts.findOne({
      where: {
        account_group_id,
        expense_head_id,
        cost_center_id,
      },
    });

    if (existing) {
      return res.redirect(
        "/ChartOfAccounts?error=This combination already exists with COA code: " +
          existing.coa_code,
      );
    }

    // Verify expense head belongs to selected account group
    const expenseHead = await Expenses_heads.findByPk(expense_head_id);
    if (
      !expenseHead ||
      expenseHead.account_code_groups_id != account_group_id
    ) {
      return res.redirect(
        "/ChartOfAccounts?error=Selected Expense Head does not belong to the selected Account Group",
      );
    }

    // Generate COA code
    const coaCode = await generateCOACode(
      account_group_id,
      expense_head_id,
      cost_center_id,
    );

    // Create Chart of Accounts
    await ChartOfAccounts.create({
      account_group_id,
      expense_head_id,
      cost_center_id,
      coa_code: coaCode,
      status: status === "true" || status === "1" ? true : false,
    });

    res.redirect(
      "/ChartOfAccounts?success=Chart of Accounts created successfully with code: " +
        coaCode,
    );
  } catch (error) {
    console.error("Error creating chart of accounts:", error);
    res.redirect(
      "/ChartOfAccounts?error=" +
        (error.message || "Failed to create Chart of Accounts"),
    );
  }
};

// Get Chart of Accounts by ID (API endpoint)
exports.getChartOfAccountsById = async (req, res) => {
  try {
    const { id } = req.params;
    const coa = await ChartOfAccounts.findByPk(id, {
      include: [
        {
          model: AccountCodeGroup,
          as: "accountCodeGroup",
        },
        {
          model: Expenses_heads,
          as: "expenseHead",
        },
        {
          model: CostCenter,
          as: "costCenter",
        },
      ],
    });

    if (!coa) {
      return res.status(404).json({
        success: false,
        message: "Chart of Accounts not found",
      });
    }

    res.status(200).json({
      success: true,
      data: coa,
    });
  } catch (error) {
    console.error("Error fetching chart of accounts:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update Chart of Accounts
exports.updateChartOfAccounts = async (req, res) => {
  try {
    const { id } = req.params;
    const { account_group_id, expense_head_id, cost_center_id, status } =
      req.body;

    // Validate required fields
    if (!account_group_id || !expense_head_id || !cost_center_id) {
      return res.redirect("/ChartOfAccounts?error=All fields are required");
    }

    const coa = await ChartOfAccounts.findByPk(id);

    if (!coa) {
      return res.redirect("/ChartOfAccounts?error=Chart of Accounts not found");
    }

    // Check if the new combination already exists (excluding current record)
    const { Op } = require("sequelize");
    const existing = await ChartOfAccounts.findOne({
      where: {
        account_group_id,
        expense_head_id,
        cost_center_id,
        id: { [Op.ne]: id },
      },
    });

    if (existing) {
      return res.redirect(
        "/ChartOfAccounts?error=This combination already exists with COA code: " +
          existing.coa_code,
      );
    }

    // Verify expense head belongs to selected account group
    const expenseHead = await Expenses_heads.findByPk(expense_head_id);
    if (
      !expenseHead ||
      expenseHead.account_code_groups_id != account_group_id
    ) {
      return res.redirect(
        "/ChartOfAccounts?error=Selected Expense Head does not belong to the selected Account Group",
      );
    }

    // Generate new COA code
    const newCoaCode = await generateCOACode(
      account_group_id,
      expense_head_id,
      cost_center_id,
    );

    // Update Chart of Accounts
    await coa.update({
      account_group_id,
      expense_head_id,
      cost_center_id,
      coa_code: newCoaCode,
      status: status === "1" || status === 1 ? true : false,
    });

    res.redirect(
      "/ChartOfAccounts?success=Chart of Accounts updated successfully with code: " +
        newCoaCode,
    );
  } catch (error) {
    console.error("Error updating chart of accounts:", error);
    res.redirect(
      "/ChartOfAccounts?error=" +
        (error.message || "Failed to update Chart of Accounts"),
    );
  }
};

// Delete Chart of Accounts
exports.deleteChartOfAccounts = async (req, res) => {
  try {
    const { id } = req.params;
    const coa = await ChartOfAccounts.findByPk(id);

    if (!coa) {
      return res.redirect("/ChartOfAccounts?error=Chart of Accounts not found");
    }

    // TODO: Check if used in transactions
    // Example:
    // const transactionCount = await Transaction.count({
    //   where: { chart_of_accounts_id: id }
    // });
    // if (transactionCount > 0) {
    //   return res.redirect(
    //     "/ChartOfAccounts?error=Cannot delete: This COA is used in " + transactionCount + " transaction(s)"
    //   );
    // }

    await coa.destroy();
    res.redirect(
      "/ChartOfAccounts?success=Chart of Accounts deleted successfully",
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/ChartOfAccounts?error=Cannot delete: This COA is used in transactions or other records",
      );
    }
    console.error("Error deleting chart of accounts:", error);
    res.redirect("/ChartOfAccounts?error=Failed to delete Chart of Accounts");
  }
};
