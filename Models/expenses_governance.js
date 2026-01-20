"use strict";

module.exports = (sequelize, DataTypes) => {
  const Expenses_Governance = sequelize.define(
    "Expenses_Governance", // MODEL name
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      code: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      cost_center_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      expense_head_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      head_corporate_office: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      province_office: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      branch: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      extension_counter: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "expenses_governances", // TABLE name
      timestamps: true,
    }
  );

  // 🔗 Associations (MODEL names only, NOT table names)
  Expenses_Governance.associate = function (models) {
    Expenses_Governance.belongsTo(models.CostCenter, {
      foreignKey: "cost_center_id",
      as: "costCenter",
    });

    Expenses_Governance.belongsTo(models.Expenses_heads, {
      foreignKey: "expense_head_id",
      as: "expenseHead",
    });
  };

  return Expenses_Governance;
};
