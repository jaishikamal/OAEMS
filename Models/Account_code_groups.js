"use strict";

module.exports = (sequelize, DataTypes) => {
  const AccountCodeGroup = sequelize.define(
    "AccountCodeGroup", // Model name
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "account_code_groups", // DB table name
      timestamps: true,
    }
  );

  // ✅ Associations must be OUTSIDE define()
  AccountCodeGroup.associate = function (models) {
    AccountCodeGroup.hasMany(models.Expenses_heads, {
      foreignKey: "account_code_groups_id",
      as: "expensesHeads",
    });
  };

  return AccountCodeGroup;
};
