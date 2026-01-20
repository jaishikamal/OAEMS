"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("expenses_governances", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      code: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },

      cost_center_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "cost_centers", // parent table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      expense_head_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "expenses_heads", // parent table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      head_corporate_office: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      province_office: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      branch: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      extension_counter: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Indexes for performance
    await queryInterface.addIndex("expenses_governances", ["cost_center_id"]);
    await queryInterface.addIndex("expenses_governances", ["expense_head_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("expenses_governances");
  },
};
