"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Payment_Banking_Details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      preferredPaymentMode: {
        type: Sequelize.ENUM(
          "Bank Transfer",
          "Cash",
          "Cheque"
        ),
        allowNull: false,
      },
      bankName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      accountName: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      accountNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      branchName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      paymentTerms: {
        type: Sequelize.ENUM(
          "Net 15",
          "Net 30",
          "Net 45",
          "Net 60",
          "Advance Payment",
          "COD"
        ),
        allowNull: false,
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
    await queryInterface.addIndex("Payment_Banking_Details", [
      "preferredPaymentMode",
    ]);
    await queryInterface.addIndex("Payment_Banking_Details", ["paymentTerms"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Payment_Banking_Details");
  },
};