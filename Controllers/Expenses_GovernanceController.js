const {
  Expenses_Governance,
  Expenses_heads,
  CostCenter,
  AccountCodeGroup,
} = require("../Models");

exports.Expenses_GovernanceManagement = async (req, res) => {
  try {
    const expensesGovernances = await Expenses_Governance.findAll({
      include: [
        {
          model: CostCenter,
          as: "costCenter",
        },
        {
          model: Expenses_heads,
          as: "expenseHead",
          include: [
            {
              model: AccountCodeGroup,
              as: "accountCodeGroup",
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    const expensesHeads = await Expenses_heads.findAll({
      include: [
        {
          model: AccountCodeGroup,
          as: "accountCodeGroup",
        },
      ],
      where: { status: true },
      order: [["title", "ASC"]],
    });

    const costCenters = await CostCenter.findAll({
      where: { status: true },
      order: [["title", "ASC"]],
    });

    res.render("pages/Expenses_governance", {
      pageTitle: "Expenses Governance Management",
      layout: "main",
      expensesGovernances,
      expensesHeads,
      costCenters,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error(error);
    res.render("pages/Expenses_governance", {
      expensesGovernances: [],
      expensesHeads: [],
      costCenters: [],
      error: "Failed to load data",
    });
  }
};

// Helper function to generate unique 3-digit code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    // Generate random 3-digit number (100 to 999)
    code = Math.floor(100 + Math.random() * 900);

    // Check if code already exists
    const existing = await Expenses_Governance.findOne({ where: { code } });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Helper function to get next auto-increment code
const getNextAutoIncrementCode = async () => {
  const lastRecord = await Expenses_Governance.findOne({
    order: [["code", "DESC"]],
  });

  if (!lastRecord) {
    return 100; // Start from 100 if no records exist
  }

  const nextCode = parseInt(lastRecord.code) + 1;

  // Ensure it stays within 3-digit range
  if (nextCode > 999) {
    // If exceeded 999, find a gap or use random
    return await generateUniqueCode();
  }

  // Check if next code is already taken
  const existing = await Expenses_Governance.findOne({
    where: { code: nextCode },
  });
  if (existing) {
    return await generateUniqueCode();
  }

  return nextCode;
};

// Create expenses governance
exports.createExpenses_Governance = async (req, res) => {
  try {
    const {
      cost_center_id,
      expense_head_id,
      code,
      title,
      head_corporate_office,
      province_office,
      branch,
      extension_counter,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/ExpensesGovernance?error=Title is required");
    }

    if (!cost_center_id) {
      return res.redirect("/ExpensesGovernance?error=Cost Center is required");
    }

    if (!expense_head_id) {
      return res.redirect("/ExpensesGovernance?error=Expense Head is required");
    }

    // Verify cost center exists
    const costCenter = await CostCenter.findByPk(cost_center_id);
    if (!costCenter) {
      return res.redirect("/ExpensesGovernance?error=Invalid Cost Center");
    }

    // Verify expense head exists
    const expenseHead = await Expenses_heads.findByPk(expense_head_id);
    if (!expenseHead) {
      return res.redirect("/ExpensesGovernance?error=Invalid Expense Head");
    }

    let finalCode;

    // If user provides a code, validate and use it
    if (code && code.trim() !== "") {
      const userCode = parseInt(code);

      // Validate 3-digit range
      if (userCode < 100 || userCode > 999) {
        return res.redirect(
          "/ExpensesGovernance?error=Code must be a 3-digit number (100-999)",
        );
      }

      // Check if code already exists
      const existing = await Expenses_Governance.findOne({
        where: { code: userCode },
      });
      if (existing) {
        return res.redirect(
          "/ExpensesGovernance?error=Code already exists. Please use a different code.",
        );
      }

      finalCode = userCode;
    } else {
      // Auto-increment from last code
      finalCode = await getNextAutoIncrementCode();
    }

    await Expenses_Governance.create({
      cost_center_id: cost_center_id,
      expense_head_id: expense_head_id,
      code: finalCode,
      title: title.trim(),
      head_corporate_office:
        head_corporate_office === "true" || head_corporate_office === "1"
          ? true
          : false,
      province_office:
        province_office === "true" || province_office === "1" ? true : false,
      branch: branch === "true" || branch === "1" ? true : false,
      extension_counter:
        extension_counter === "true" || extension_counter === "1"
          ? true
          : false,
    });

    res.redirect(
      "/ExpensesGovernance?success=Expenses Governance created successfully with code: " +
        finalCode,
    );
  } catch (error) {
    console.error("Error creating expenses governance:", error);
    res.redirect(
      "/ExpensesGovernance?error=Failed to create expenses governance",
    );
  }
};

// Get expenses governance by ID (API endpoint)
exports.getExpenses_GovernanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const expensesGovernance = await Expenses_Governance.findByPk(id, {
      include: [
        {
          model: CostCenter,
          as: "costCenter",
        },
        {
          model: Expenses_heads,
          as: "expenseHead",
          include: [
            {
              model: AccountCodeGroup,
              as: "accountCodeGroup",
            },
          ],
        },
      ],
    });

    if (!expensesGovernance) {
      return res.status(404).json({
        success: false,
        message: "Expenses Governance not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expensesGovernance,
    });
  } catch (error) {
    console.error("Error fetching expenses governance:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update expenses governance
exports.updateExpenses_Governance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cost_center_id,
      expense_head_id,
      title,
      head_corporate_office,
      province_office,
      branch,
      extension_counter,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/ExpensesGovernance?error=Title is required");
    }

    if (!cost_center_id) {
      return res.redirect("/ExpensesGovernance?error=Cost Center is required");
    }

    if (!expense_head_id) {
      return res.redirect("/ExpensesGovernance?error=Expense Head is required");
    }

    const expensesGovernance = await Expenses_Governance.findByPk(id);

    if (!expensesGovernance) {
      return res.redirect(
        "/ExpensesGovernance?error=Expenses Governance not found",
      );
    }

    // Verify cost center exists
    const costCenter = await CostCenter.findByPk(cost_center_id);
    if (!costCenter) {
      return res.redirect("/ExpensesGovernance?error=Invalid Cost Center");
    }

    // Verify expense head exists
    const expenseHead = await Expenses_heads.findByPk(expense_head_id);
    if (!expenseHead) {
      return res.redirect("/ExpensesGovernance?error=Invalid Expense Head");
    }

    // Code cannot be changed, only other fields
    await expensesGovernance.update({
      cost_center_id: cost_center_id,
      expense_head_id: expense_head_id,
      title: title.trim(),
      head_corporate_office:
        head_corporate_office === "1" || head_corporate_office === 1
          ? true
          : false,
      province_office:
        province_office === "1" || province_office === 1 ? true : false,
      branch: branch === "1" || branch === 1 ? true : false,
      extension_counter:
        extension_counter === "1" || extension_counter === 1 ? true : false,
    });

    res.redirect(
      "/ExpensesGovernance?success=Expenses Governance updated successfully",
    );
  } catch (error) {
    console.error("Error updating expenses governance:", error);
    res.redirect(
      "/ExpensesGovernance?error=Failed to update expenses governance",
    );
  }
};

// Delete expenses governance
exports.deleteExpenses_Governance = async (req, res) => {
  try {
    const { id } = req.params;
    const expensesGovernance = await Expenses_Governance.findByPk(id);

    if (!expensesGovernance) {
      return res.redirect(
        "/ExpensesGovernance?error=Expenses governance not found",
      );
    }

    await expensesGovernance.destroy();
    res.redirect(
      "/ExpensesGovernance?success=Expenses governance deleted successfully",
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/ExpensesGovernance?error=Cannot delete: Expenses governance is used in other records",
      );
    }
    console.error("Error deleting expenses governance:", error);
    res.redirect(
      "/ExpensesGovernance?error=Failed to delete expenses governance",
    );
  }
};
