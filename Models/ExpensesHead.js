"use strict";

module.exports = (sequelize, DataTypes) => {
  const Expenses_heads = sequelize.define(
    "Expenses_heads",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      account_code_groups_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "account_code_groups",
          key: "id",
        },
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "expenses_heads",
      timestamps: true,
      indexes: [
        {
          fields: ["account_code_groups_id"],
        },
      ],
    },
  );

  // Define associations
  Expenses_heads.associate = function (models) {
    // Belongs to Account Code Groups
    Expenses_heads.belongsTo(models.AccountCodeGroup, {
      foreignKey: "account_code_groups_id",
      as: "accountCodeGroup",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });
  };

  return Expenses_heads;
};
