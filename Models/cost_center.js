"use strict";

module.exports = (sequelize, DataTypes) => {
  const CostCenter = sequelize.define(
    "CostCenter", // Model name
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          "HEAD_OFFICE",
          "PROVINCE_OFFICE",
          "BRANCH",
          "EXTENSION_COUNTER",
        ),
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // true = active, false = inactive
      },
    },
    {
      tableName: "cost_centers", // Maps to your existing table
      timestamps: true, // Adds createdAt and updatedAt fields
    },
  );

  return CostCenter;
};
