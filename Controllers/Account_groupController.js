const { AccountCodeGroup } = require("../models");

// Account Code Group Management page
exports.AccountCodeGroupManagement = async (req, res) => {
  try {
    const accountGroupData = await AccountCodeGroup.findAll({
      raw: true,
      order: [["createdAt", "DESC"]],
    });

    res.render("pages/AccountCodeGroup", {
      pageTitle: "Account Code Group Management",
      layout: "main",
      accountGroupData: accountGroupData,
      success: req.query.success,
      error: req.query.error,
    });
    console.log(accountGroupData);
  } catch (error) {
    console.error("Error fetching account code groups:", error);
    res.status(500).render("pages/AccountCodeGroup", {
      pageTitle: "Account Code Group Management",
      layout: "main",
      accountGroupData: [],
      error: "Failed to load account code groups",
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
    const existing = await AccountCodeGroup.findOne({ where: { code } });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Create account code group
exports.createAccountCodeGroup = async (req, res) => {
  try {
    const { description, status } = req.body;

    // Validate required fields
    if (!description) {
      return res.redirect("/account-code-groups?error=Description is required");
    }

    // Generate unique code automatically
    const code = await generateUniqueCode();

    await AccountCodeGroup.create({
      code: code,
      description: description.trim(),
      status: status === "true" || status === "1" ? true : false,
    });

    res.redirect(
      "/AccountCodeGroup?success=Account code group created successfully with code: " +
        code
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
    const { description, status } = req.body;

    // Validate required fields
    if (!description) {
      return res.redirect("/AccountCodeGroup?error=Description is required");
    }

    const accountCodeGroup = await AccountCodeGroup.findByPk(id);

    if (!accountCodeGroup) {
      return res.redirect(
        "/AccountCodeGroup?error=Account code group not found"
      );
    }

    // Code cannot be changed, only description and status
    await accountCodeGroup.update({
      description: description.trim(),
      status: status === "1" || status === 1 ? true : false,
    });

    res.redirect(
      "/AccountCodeGroup?success=Account code group updated successfully"
    );
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
      return res.redirect(
        "/AccountCodeGroup?error=Account code group not found"
      );
    }

    // check if the account code group is used in other records
    // const usedCount = await ExpenseHead.count({
    //   where: { account_code_groups_id: id },
    // });

    // if (usedCount > 0) {
    //   return res.redirect(
    //     "/AccountCodeGroup?error=Cannot delete: Already used in expense heads"
    //   );
    // }
    await accountCodeGroup.destroy();
    res.redirect(
      "/AccountCodeGroup?success=Account code group deleted successfully"
    );
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
