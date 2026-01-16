"use strict";

module.exports = (sequelize, DataTypes) => {
  const Expenses_table = sequelize.define(
    "Expenses_table",    // ← Changed from "Expenses" to "Expenses_table"
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
      title: {                    // ← You have "description" in model
        type: DataTypes.STRING,          //   but "title" in controller!
        allowNull: false,
      },
    },
    {
      tableName: "expenses",
      timestamps: true,  // Adds createdAt and updatedAt fields       
    }
  );

  return Expenses_table;
};