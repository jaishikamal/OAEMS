const { data } = require("autoprefixer");
const { CostCenter } = require("../models");

exports.CostCenterManagement = async (req, res) => {
  try {
    const costdata = await CostCenter.findAll({raw: true});

    res.render("pages/CostCenter", {
      pageTitle: "Cost Center Management",
      layout: "main",
      costdata: costdata,
    });
    console.log("Cost Centers:", costdata);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create cost center
exports.createCostCenter = async (req, res) => {
  try {
    const { code, title, status } = req.body;
    const costCenter = await CostCenter.create({
      code,
      title,
      status,
    });
    res.status(201).json({
      success: true,
      data: costCenter,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Read all cost centers
exports.getAllCostCenters = async (req, res) => {
  try {
    const costCenters = await CostCenter.findAll();
    res.status(200).json({
      success: true,
      data: costCenters,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// read cost center by id
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
    res.status(500).json({ error: error.message });
  }
};

// update cost center by id
exports.updateCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, title, status } = req.body;
    const costCenter = await CostCenter.findByPk(id);
    if (!costCenter) {
      return res.status(404).json({
        success: false,
        message: "Cost center not found",
      });
    }
    await costCenter.update({ code, title, status });
    res.status(200).json({
      success: true,
      data: costCenter,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// delete cost center by id
exports.deleteCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const costCenter = await CostCenter.findByPk(id);
    if (!costCenter) {
      return res.status(404).json({
        success: false,
        message: "Cost center not found",
      });
    }
    await costCenter.destroy();
    res.status(200).json({
      success: true,
      message: "Cost center deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
