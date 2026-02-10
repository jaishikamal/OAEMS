// Migration: Create expenses_governance_attachments table
// Filename: YYYYMMDDHHMMSS-create-expenses-governance-attachments.js

"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("attachments", {
      id: {
        allowNull: false,   
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      attachment_type: {
        type: Sequelize.ENUM(
          "PAN Certificate",
          "VAT Certificate",
          "Bank Cheque / Letter",
          "Contract / Agreement",
        ),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_mandatory: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add index for faster queries
    await queryInterface.addIndex("attachments", ["attachment_type"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("attachments");
  },
};
