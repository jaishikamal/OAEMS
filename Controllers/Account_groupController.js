const { data } = require("autoprefixer");
const { AccountCodeGroup } = require("../models");

exports.AccountCodeGroupManagement = async (req, res) => {
  try {
    const accountGroupData = await AccountCodeGroup.findAll({raw: true});

    res.render("pages/AccountCodeGroup", {
      pageTitle: "Account Code Group Management",
      layout: "main",
      accountGroupData: accountGroupData,
    });
    console.log("Account Code Groups:", accountGroupData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create account code group
exports.createAccountCodeGroup = async (req, res) => {
  try {
    const { code, description, status } = req.body;
    const accountCodeGroup = await AccountCodeGroup.create({
      code,
      description,
      status,
    });
    res.status(201).json({
      success: true,
      data: accountCodeGroup,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// read account code group by id
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
    res.status(500).json({ error: error.message });
  }
};

// update account code group by id
exports.updateAccountCodeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, description, status } = req.body;
    const accountCodeGroup = await AccountCodeGroup.findByPk(id);
    if (!accountCodeGroup) {
      return res.status(404).json({
        success: false,
        message: "Account code group not found",
      });
    }
    await accountCodeGroup.update({ code, description, status });
    res.status(200).json({
      success: true,
      data: accountCodeGroup,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete account code group by id
exports.deleteAccountCodeGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const accountCodeGroup = await AccountCodeGroup.findByPk(id);
    if (!accountCodeGroup) {
      return res.status(404).json({
        success: false,
        message: "Account code group not found",
      });
    }
    await accountCodeGroup.destroy();
    res.status(200).json({
      success: true,
      message: "Account code group deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};  