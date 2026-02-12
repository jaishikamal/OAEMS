"use strict";

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      defaultBranchId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'default_branch_id',
        references: {
          model: "Branches",
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("active", "suspended", "terminated", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
      isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_locked',
      },
      lockUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'lock_until',
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login',
      },
      failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        field: 'failed_login_attempts',
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'password_changed_at',
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at',
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
      tableName: "users",
      timestamps: true,
      paranoid: false,
      defaultScope: {
        attributes: {
          exclude: ["password"],
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          unique: true,
          fields: ["username"],
        },
        {
          fields: ["status"],
        },
      ],
    },
  );

  User.associate = function (models) {
    // Many-to-Many with Roles
    User.belongsToMany(models.Role, {
      through: models.UserRole,
      foreignKey: "userId",
      otherKey: "roleId",
      as: "roles",
    });

    // Many-to-Many with Branches
    User.belongsToMany(models.Branch, {
      through: models.UserBranch,
      foreignKey: "userId",
      otherKey: "branchId",
      as: "branches",
    });

    // Many-to-Many with Permissions (Direct)
    User.belongsToMany(models.Permission, {
      through: models.UserPermission,
      foreignKey: "userId",
      otherKey: "permissionId",
      as: "permissions",
    });

    // Default Branch Association
    User.belongsTo(models.Branch, {
      foreignKey: "defaultBranchId",
      as: "defaultBranch",
    });

    // Audit Logs
    User.hasMany(models.AuditLog, {
      foreignKey: "userId",
      as: "auditLogs",
    });

    // Login Attempts
    User.hasMany(models.LoginAttempt, {
      foreignKey: "userId",
      as: "loginAttempts",
    });

    // Refresh Tokens
    User.hasMany(models.RefreshToken, {
      foreignKey: "userId",
      as: "refreshTokens",
    });
  };

  return User;
};
