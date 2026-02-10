"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserBranch = sequelize.define(
    "UserBranch",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      branchId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "branches",
          key: "id",
        },
      },
      assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      assignedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      accessLevel: {
        type: DataTypes.ENUM("full", "limited", "read_only"),
        defaultValue: "full",
      },
    },
    {
      tableName: "user_branches",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["userId", "branchId"],
        },
      ],
    },
  );

  return UserBranch;
};
