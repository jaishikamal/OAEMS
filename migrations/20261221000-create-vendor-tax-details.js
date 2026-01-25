"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vendor_tax_details", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      vendor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Vendor_identifications", // Verify this matches your table name
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      },

      pan_number: {
        type: Sequelize.STRING(9),
        allowNull: false,
        unique: true,
      },

      pan_holder_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      vat_registered: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      vat_number: {
        type: Sequelize.STRING(9),
        allowNull: true,
        unique: true,
      },

      vat_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },

      tds_applicable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      tds_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes for performance
    await queryInterface.addIndex("vendor_tax_details", ["pan_number"]);
    await queryInterface.addIndex("vendor_tax_details", ["vat_number"]);
    await queryInterface.addIndex("vendor_tax_details", ["vendor_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("vendor_tax_details");
  },
};