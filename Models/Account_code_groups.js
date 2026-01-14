"use strict";

module.exports = (sequelize, DataTypes) => {
  const AccountCodeGroup = sequelize.define(
    "AccountCodeGroup",          // Model name
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
      tableName: "account_code_groups", // Maps to your existing table
      timestamps: true,                  // Adds createdAt and updatedAt fields       
    }
  );

  return AccountCodeGroup;
};