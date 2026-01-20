"use strict";

module.exports = (sequelize, DataTypes) => {
  const ChartOfAccounts = sequelize.define(
    "ChartOfAccounts",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      account_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "account_code_groups",
          key: "id",
        },
      },
      expense_head_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "expenses_heads",
          key: "id",
        },
      },
      cost_center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "cost_centers",
          key: "id",
        },
      },
      coa_code: {
        type: DataTypes.STRING(9),
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "chart_of_accounts",
      timestamps: true,
      underscored: true, // Uses created_at and updated_at
      indexes: [
        {
          fields: ["account_group_id"],
        },
        {
          fields: ["expense_head_id"],
        },
        {
          fields: ["cost_center_id"],
        },
        {
          unique: true,
          fields: ["account_group_id", "expense_head_id", "cost_center_id"],
          name: "uniq_coa_combination",
        },
      ],
    }
  );

  // Define associations
  ChartOfAccounts.associate = function (models) {
    // Belongs to Account Code Group
    ChartOfAccounts.belongsTo(models.AccountCodeGroup, {
      foreignKey: "account_group_id",
      as: "accountCodeGroup",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // Belongs to Expense Head
    ChartOfAccounts.belongsTo(models.Expenses_heads, {
      foreignKey: "expense_head_id",
      as: "expenseHead",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    // Belongs to Cost Center
    ChartOfAccounts.belongsTo(models.CostCenter, {
      foreignKey: "cost_center_id",
      as: "costCenter",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });
  };

  return ChartOfAccounts;
};