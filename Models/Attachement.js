// Model: ExpensesGovernanceAttachment
// Filename: ExpensesGovernanceAttachment.js

"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      // Define association if needed (without join in queries)
      // This is just for reference, won't be used in join queries
    }
  }

  Attachment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attachment_type: {
        type: DataTypes.ENUM(
          "PAN Certificate",
          "VAT Certificate",
          "Bank Cheque / Letter",
          "Contract / Agreement",
        ),
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_mandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Attachment",
      tableName: "attachments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  return Attachment;
};
