"use strict";
const { PaymentBankingDetail } = require("../models");

exports.paymentBankingManagement = async (req, res) => {
  try {
    const paymentBankingDetails = await PaymentBankingDetail.findAll({
      order: [["id", "DESC"]],
    });

    res.render("pages/PaymentBanking", {
      pageTitle: "Payment & Banking Details Management",
      layout: "main",
      paymentBankingDetails,
      success: req.query.success,
      error: req.query.error, 
    });
  } catch (error) {
    console.error(error);
    res.render("pages/PaymentBanking", {
      paymentBankingDetails: [],
      error: "Failed to load data",
    });
  }
};

// Create payment banking detail
exports.createPaymentBanking = async (req, res) => {
  try {
    const {
      preferredPaymentMode,
      bankName,
      accountName,
      accountNumber,
      branchName,
      paymentTerms,
    } = req.body;

    // Validate required fields
    if (!preferredPaymentMode) {
      return res.redirect(
        "/PaymentBanking?error=Preferred Payment Mode is required"
      );
    }

    if (!paymentTerms) {
      return res.redirect("/PaymentBanking?error=Payment Terms are required");
    }

    // Validate conditional fields for Bank Transfer
    if (preferredPaymentMode === "Bank Transfer") {
      if (!bankName || !bankName.trim()) {
        return res.redirect(
          "/PaymentBanking?error=Bank Name is required for Bank Transfer"
        );
      }
      if (!accountName || !accountName.trim()) {
        return res.redirect(
          "/PaymentBanking?error=Account Name is required for Bank Transfer"
        );
      }
      if (!accountNumber || !accountNumber.trim()) {
        return res.redirect(
          "/PaymentBanking?error=Account Number is required for Bank Transfer"
        );
      }
    }

    await PaymentBankingDetail.create({
      preferredPaymentMode,
      bankName: bankName?.trim() || null,
      accountName: accountName?.trim() || null,
      accountNumber: accountNumber?.trim() || null,
      branchName: branchName?.trim() || null,
      paymentTerms,
    });

    res.redirect(
      "/PaymentBanking?success=Payment & Banking Details created successfully"
    );
  } catch (error) {
    console.error("Error creating payment banking detail:", error);
    res.redirect(
      "/PaymentBanking?error=" +
        (error.message || "Failed to create payment banking detail")
    );
  }
};

// Get payment banking detail by ID (API endpoint)
exports.getPaymentBankingById = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentBanking = await PaymentBankingDetail.findByPk(id);

    if (!paymentBanking) {
      return res.status(404).json({
        success: false,
        message: "Payment & Banking Detail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: paymentBanking,
    });
  } catch (error) {
    console.error("Error fetching payment banking detail:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update payment banking detail
exports.updatePaymentBanking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      preferredPaymentMode,
      bankName,
      accountName,
      accountNumber,
      branchName,
      paymentTerms,
    } = req.body;

    // Validate required fields
    if (!preferredPaymentMode) {
      return res.redirect(
        "/PaymentBanking?error=Preferred Payment Mode is required"
      );
    }

    if (!paymentTerms) {
      return res.redirect("/PaymentBanking?error=Payment Terms are required");
    }

    const paymentBanking = await PaymentBankingDetail.findByPk(id);

    if (!paymentBanking) {
      return res.redirect(
        "/PaymentBanking?error=Payment & Banking Detail not found"
      );
    }

    // Validate conditional fields for Bank Transfer
    if (preferredPaymentMode === "Bank Transfer") {
      if (!bankName || !bankName.trim()) {
        return res.redirect(
          "/PaymentBanking?error=Bank Name is required for Bank Transfer"
        );
      }
      if (!accountName || !accountName.trim()) {
        return res.redirect(
          "/PaymentBanking?error=Account Name is required for Bank Transfer"
        );
      }
      if (!accountNumber || !accountNumber.trim()) {
        return res.redirect(
          "/PaymentBanking?error=Account Number is required for Bank Transfer"
        );
      }
    }

    await paymentBanking.update({
      preferredPaymentMode,
      bankName: bankName?.trim() || null,
      accountName: accountName?.trim() || null,
      accountNumber: accountNumber?.trim() || null,
      branchName: branchName?.trim() || null,
      paymentTerms,
    });

    res.redirect(
      "/PaymentBanking?success=Payment & Banking Details updated successfully"
    );
  } catch (error) {
    console.error("Error updating payment banking detail:", error);
    res.redirect(
      "/PaymentBanking?error=Failed to update payment banking detail"
    );
  }
};

// Delete payment banking detail
exports.deletePaymentBanking = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentBanking = await PaymentBankingDetail.findByPk(id);

    if (!paymentBanking) {
      return res.redirect(
        "/PaymentBanking?error=Payment & Banking Detail not found"
      );
    }

    await paymentBanking.destroy();
    res.redirect(
      "/PaymentBanking?success=Payment & Banking Details deleted successfully"
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/PaymentBanking?error=Cannot delete: Payment & Banking Detail is used in other records"
      );
    }
    console.error("Error deleting payment banking detail:", error);
    res.redirect(
      "/PaymentBanking?error=Failed to delete payment banking detail"
    );
  }
};