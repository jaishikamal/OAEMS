"use strict";

module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
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
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'revoked_at',
      },
      revokedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'revoked_by',
      },
      isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_revoked',
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
      tableName: "refresh_tokens",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["token"],
          unique: true,
        },
        {
          fields: ["expiresAt"],
        },
      ],
    },
  );

  RefreshToken.associate = function (models) {
    RefreshToken.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return RefreshToken;
};
