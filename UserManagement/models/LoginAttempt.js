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
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "login_attempts",
      timestamps: true,
      createdAt: true,
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
