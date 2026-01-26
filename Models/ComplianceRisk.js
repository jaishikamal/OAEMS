"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ComplianceRisk extends Model {
    static associate(models) {
      // Add associations here if needed
    }
  }

  ComplianceRisk.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      vendorRiskCategory: {
        type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
        allowNull: false,
        validate: {
          notNull: { msg: "Vendor Risk Category is required" },
          notEmpty: { msg: "Vendor Risk Category cannot be empty" },
          isIn: {
            args: [["Low", "Medium", "High", "Critical"]],
            msg: "Invalid vendor risk category",
          },
        },
      },
      relatedParty: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: { msg: "Related Party field is required" },
        },
      },
      governmentVendor: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: { msg: "Government Vendor field is required" },
        },
      },
      blacklisted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: { msg: "Blacklisted field is required" },
        },
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ComplianceRisk",
      tableName: "Compliance_Risk",
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeCreate: async (complianceRisk) => {
          // Validate remarks for blacklisted vendors
          if (complianceRisk.blacklisted && !complianceRisk.remarks) {
            throw new Error("Remarks are required for blacklisted vendors");
          }
        },
        beforeUpdate: async (complianceRisk) => {
          // Validate remarks for blacklisted vendors
          if (complianceRisk.blacklisted && !complianceRisk.remarks) {
            throw new Error("Remarks are required for blacklisted vendors");
          }
        },
      },
    }
  );

  return ComplianceRisk;
};