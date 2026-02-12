"use strict";

module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define(
    "Branch",
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
      parentBranchId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'parent_branch_id',
        references: {
          model: "branches",
          key: "id",
        },
      },
      level: {
        type: DataTypes.ENUM("head_office", "regional", "local"),
        defaultValue: "local",
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      manager: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
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
      tableName: "branches",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["code"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["level"],
        },
      ],
    },
  );

  Branch.associate = function (models) {
    // Self-referencing for hierarchy
    Branch.belongsTo(Branch, {
      foreignKey: "parentBranchId",
      as: "parentBranch",
    });

    Branch.hasMany(Branch, {
      foreignKey: "parentBranchId",
      as: "childBranches",
    });

    // Many-to-Many with Users
    Branch.belongsToMany(models.User, {
      through: models.UserBranch,
      foreignKey: "branchId",
      otherKey: "userId",
      as: "users",
    });

    // Users default branch
    Branch.hasMany(models.User, {
      foreignKey: "defaultBranchId",
      as: "defaultUsers",
    });
  };

  return Branch;
};
