"use strict";

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define(
    "Permission",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      resource: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      action: {
        type: DataTypes.ENUM("create", "read", "update", "delete", "execute"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_system',
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'created_by',
      },
      updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'updated_by',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      tableName: "permissions",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["code"],
        },
        {
          fields: ["module"],
        },
        {
          fields: ["resource"],
        },
        {
          fields: ["action"],
        },
      ],
    },
  );

  Permission.associate = function (models) {
    // Many-to-Many with Roles
    Permission.belongsToMany(models.Role, {
      through: models.RolePermission,
      foreignKey: "permissionId",
      otherKey: "roleId",
      as: "roles",
    });

    // Many-to-Many with Users (Direct)
    Permission.belongsToMany(models.User, {
      through: models.UserPermission,
      foreignKey: "permissionId",
      otherKey: "userId",
      as: "users",
    });
  };

  return Permission;
};
