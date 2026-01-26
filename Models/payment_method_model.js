"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PaymentBankingDetail extends Model {
    static associate(models) {
      
    }

    // Instance method to validate conditional fields
    validateBankingFields() {
      if (this.preferredPaymentMode === "Bank Transfer") {
        if (!this.bankName || !this.accountName || !this.accountNumber) {
          throw new Error(
            "Bank name, account name, and account number are required for Bank Transfer"
          );
        }
      }
      return true;
    }
  }

  PaymentBankingDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      
      preferredPaymentMode: {
        type: DataTypes.ENUM(
          "Bank Transfer",
          "Cash",
          "Cheque"
        ),
        allowNull: false,
        validate: {
          notNull: { msg: "Preferred payment mode is required" },
          notEmpty: { msg: "Preferred payment mode cannot be empty" },
        },
      },
      bankName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      accountName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      accountNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      branchName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      paymentTerms: {
        type: DataTypes.ENUM(
          "Net 15",
          "Net 30",
          "Net 45",
          "Net 60",
          "Due on Receipt",
          "COD"
        ),
        allowNull: false,
        validate: {
          notNull: { msg: "Payment terms are required" },
          notEmpty: { msg: "Payment terms cannot be empty" },
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PaymentBankingDetail",
      tableName: "Payment_Banking_Details",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: async (paymentDetail) => {
          paymentDetail.validateBankingFields();
        },
        beforeUpdate: async (paymentDetail) => {
          paymentDetail.validateBankingFields();
        },
      },
    }
  );

  return PaymentBankingDetail;
};