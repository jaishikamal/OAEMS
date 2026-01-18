  "use strict";

  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable(
        "expenses_heads",
        {
          id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          account_code_groups_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: "account_code_groups",
              key: "id",
            },
          
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
          },
          code: {
            type: Sequelize.STRING(10),
            allowNull: false,
            unique: true,
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          status: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
        },
        {
          engine: "InnoDB",
        }
      );

      await queryInterface.addIndex("expenses_heads", ["account_code_groups_id"]);
    },

    async down(queryInterface) {
      await queryInterface.dropTable("expenses_heads");
    },
  };
