"use strict";

module.exports = (sequelize, DataTypes) => {
  const LoginAttempt = sequelize.define(
    "LoginAttempt",
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isSuccessful: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_successful',
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
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
      deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'device_info',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
    },
    {
      tableName: "login_attempts",
      timestamps: true,
      updatedAt: false,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["email"],
        },
        {
          fields: ["isSuccessful"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    },
  );

  LoginAttempt.associate = function (models) {
    LoginAttempt.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return LoginAttempt;
};
