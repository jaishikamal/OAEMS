const { Expenses_table } = require("../models");

// Expenses Head Management page
exports.Expenses_tableManagement = async (req, res) => {
  try {
    const expensesData = await Expenses_table.findAll({
      raw: true,
      order: [["id", "DESC"]],  
    });

    res.render("pages/Expenses_table", {
      pageTitle: "Expenses Head Management",
      layout: "main",
      expenses_tableData: expensesData,
      success: req.query.success,
      error: req.query.error,
    });
    console.log(expensesData);
  } catch (error) {
    console.error("Error fetching expenses heads:", error);
    res.status(500).render("pages/Expenses_table", {
      pageTitle: "Expenses_table Management",
      layout: "main",
      expenses_tableData: [],
      error: "Failed to load expenses heads",
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
    const existing = await Expenses_table.findOne({ where: { code } });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Create expenses
exports.createExpenses = async (req, res) => {
  try {
    const { title, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/Expenses_table?error=Title is required");
    }

    // Generate unique code automatically
    const code = await generateUniqueCode();

    await Expenses_table.create({
      code: code,
      title: title.trim(),
      status: status === "true" || status === "1" ? true : false,
    });

    res.redirect(
      "/Expenses_table?success=Expenses Head created successfully with code: " +
        code
    );
  } catch (error) {
    console.error("Error creating expenses head:", error);
    res.redirect("/Expenses_table?error=Failed to create expenses head");
  }
};

// Get expenses by ID (API endpoint)
exports.getExpensesById = async (req, res) => {
  try {
    const { id } = req.params;
    const expenses = await Expenses_table.findByPk(id);

    if (!expenses) {
      return res.status(404).json({
        success: false,
        message: "Expenses Head not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error("Error fetching expenses head:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update expenses 
exports.updateExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;

    // Validate required fields
    if (!title) {
      return res.redirect("/Expenses_table?error=Title is required");
    }

    const expenses = await Expenses_table.findByPk(id);

    if (!expenses) {
      return res.redirect("/Expenses_table?error=Expenses Head not found");
    }

    // Code cannot be changed, only title and status
    await expenses.update({
      title: title.trim(),
      status: status === "1" || status === 1 ? true : false,
    });

    res.redirect("/Expenses_table?success=Expenses Head updated successfully");
  } catch (error) {
    console.error("Error updating expenses head:", error);
    res.redirect("/Expenses_table?error=Failed to update expenses head");
  }
};

// Delete expenses
exports.deleteExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    const expenses = await Expenses_table.findByPk(id);

    if (!expenses) {
      return res.redirect("/Expenses_table?error=Expenses head not found");
    }

    await expenses.destroy();
    res.redirect(
      "/Expenses_table?success=Expenses head deleted successfully"
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/Expenses_table?error=Cannot delete: Expenses head is used in other records"
      );
    }
    console.error("Error deleting expenses head:", error);
    res.redirect("/Expenses_table?error=Failed to delete expenses head");
  }
};