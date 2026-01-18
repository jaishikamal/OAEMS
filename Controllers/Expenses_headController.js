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

// Helper function to generate unique 5-digit code
const generateUniqueCode = async () => {
  let code;
  let isUnique = false;

  while (!isUnique) {
    // Generate random 5-digit number (10000 to 99999)
    code = Math.floor(10000 + Math.random() * 90000).toString();

    // Check if code already exists
    const existing = await Expenses_heads.findOne({ where: { code } });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Create expenses head
exports.createExpenses_head = async (req, res) => {
  try {
    const { account_code_groups_id, title, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/Expenses_head?error=Title is required");
    }

    if (!account_code_groups_id) {
      return res.redirect(
        "/Expenses_head?error=Account Code Group is required"
      );
    }

    // Verify account code group exists
    const accountGroup = await AccountCodeGroup.findByPk(
      account_code_groups_id
    );
    if (!accountGroup) {
      return res.redirect("/Expenses_head?error=Invalid Account Code Group");
    }

    // Generate unique code automatically
    const code = await generateUniqueCode();

    await Expenses_heads.create({
      account_code_groups_id: account_code_groups_id,
      code: code,
      title: title.trim(),
      status: status === "true" || status === "1" ? true : false,
    });

    res.redirect(
      "/Expenses_head?success=Expenses Head created successfully with code: " +
        code
    );
  } catch (error) {
    console.error("Error creating expenses head:", error);
    res.redirect("/Expenses_head?error=Failed to create expenses head");
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
        "/Expenses_head?error=Account Code Group is required"
      );
    }

    const expensesHead = await Expenses_heads.findByPk(id);

    if (!expensesHead) {
      return res.redirect("/Expenses_head?error=Expenses Head not found");
    }

    // Verify account code group exists
    const accountGroup = await AccountCodeGroup.findByPk(
      account_code_groups_id
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
        "/Expenses_head?error=Cannot delete: Expenses head is used in other records"
      );
    }
    console.error("Error deleting expenses head:", error);
    res.redirect("/Expenses_head?error=Failed to delete expenses head");
  }
};
