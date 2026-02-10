"use strict";

module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    "RolePermission",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "roles",
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
      assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      assignedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      tableName: "role_permissions",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["roleId", "permissionId"],
        },
      ],
    },
  );

  return RolePermission;
};
