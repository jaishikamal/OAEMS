"use strict";
modules.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Compliance_Risk", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vendorRiskCategory: {
        type: Sequelize.ENUM("Low", "Medium", "High", "Critical"),
        allowNull: false,
      },
      relatedParty: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      governmentVendor: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      blacklisted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    // Add indexes
    await queryInterface.addIndex("Compliance_Risk", ["vendorRiskCategory"]);
    await queryInterface.addIndex("Compliance_Risk", ["blacklisted"]);
    await queryInterface.addIndex("Compliance_Risk", ["relatedParty"]);
    await queryInterface.addIndex("Compliance_Risk", ["governmentVendor"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Compliance_Risk");
  },
};