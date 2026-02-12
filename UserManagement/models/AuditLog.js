"use strict";

module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    "AuditLog",
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
        field: 'user_id',
        references: {
          model: "users",
          key: "id",
        },
      },
      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'entity_type',
      },
      entityId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'entity_id',
      },
      changes: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      oldValues: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'old_values',
      },
      newValues: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'new_values',
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'ip_address',
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'user_agent',
      },
      status: {
        type: DataTypes.ENUM("success", "failure", "warning"),
        defaultValue: "success",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
    },
    {
      tableName: "audit_logs",
      timestamps: true,
      updatedAt: false,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["entityType"],
        },
        {
          fields: ["entityId"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    },
  );

  AuditLog.associate = function (models) {
    AuditLog.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return AuditLog;
};
