"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chart_of_accounts", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      account_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "account_code_groups",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      expense_head_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "expenses_heads",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      cost_center_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "cost_centers",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      coa_code: {
        type: Sequelize.STRING(9),
        allowNull: false,
        unique: true,
      },

      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // prevent duplicate AAA+BBB+CCC
    await queryInterface.addConstraint("chart_of_accounts", {
      fields: ["account_group_id", "expense_head_id", "cost_center_id"],
      type: "unique",
      name: "uniq_coa_combination",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("chart_of_accounts");
  },
};
