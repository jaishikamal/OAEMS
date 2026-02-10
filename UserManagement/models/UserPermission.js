"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define(
    "UserPermission",
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
      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id",
        },
      },
      grantType: {
        type: DataTypes.ENUM("grant", "deny"),
        defaultValue: "grant",
      },
      assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      assignedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "user_permissions",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["userId", "permissionId"],
        },
      ],
    },
  );

  return UserPermission;
};
