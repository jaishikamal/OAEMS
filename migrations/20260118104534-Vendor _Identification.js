"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Vendor_Identification", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      vendorId: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      vendorLegalName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tradeName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vendorType: {
        type: Sequelize.ENUM("Individual", "Company", "Government"),
        allowNull: false,
      },
      vendorCategory: {
        type: Sequelize.ENUM(
          "Stationery",
          "Travel",
          "IT",
          "Consulting",
          "Equipment",
          "Services",
          "Other",
        ),
        allowNull: false,
      },
      country: {
        type: Sequelize.ENUM("Nepal", "Foreign"),
        allowNull: false,
        defaultValue: "Nepal",
      },
      status: {
        type: Sequelize.ENUM(
          "Draft",
          "Pending",
          "Active",
          "Inactive",
          "Rejected",
        ),
        allowNull: true,
        defaultValue: "Draft",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Add indexes
    await queryInterface.addIndex("Vendor_Identification", ["vendorId"]);
    await queryInterface.addIndex("Vendor_Identification", ["status"]);
    await queryInterface.addIndex("Vendor_Identification", ["vendorType"]);
    await queryInterface.addIndex("Vendor_Identification", ["country"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Vendor_Identification");
  },
};
