"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VendorTaxDetail extends Model {
    static associate(models) {
      // Belongs to Vendor
      VendorTaxDetail.belongsTo(models.Vendor_Identification, {
        foreignKey: "vendor_id",
        as: "vendor",
        targetKey: "id", // Explicitly specify the target key
      });
    }

    // Instance method to get effective VAT rate
    getEffectiveVatRate() {
      if (!this.vat_registered) return 0;
      return parseFloat(this.vat_rate) || 13.0;
    }

    // Instance method to get effective TDS rate
    getEffectiveTdsRate() {
      if (!this.tds_applicable) return 0;
      return parseFloat(this.tds_rate) || 0;
    }
  }

  VendorTaxDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: {
          msg: "Tax details already exist for this vendor",
        },
        references: {
          model: "vendor_Identification",
          key: "id",
        },
        validate: {
          notNull: {
            msg: "Vendor ID is required",
          },
          notEmpty: {
            msg: "Vendor ID cannot be empty",
          },
        },
      },

      pan_number: {
        type: DataTypes.STRING(9),
        allowNull: false,
        unique: {
          msg: "PAN number already exists",
        },
        validate: {
          notNull: {
            msg: "PAN number is required",
          },
          notEmpty: {
            msg: "PAN number cannot be empty",
          },
          len: {
            args: [9, 9],
            msg: "PAN number must be exactly 9 digits",
          },
          isNumeric: {
            msg: "PAN number must contain only digits",
          },
        },
        set(value) {
          // Remove any spaces or special characters
          if (value) {
            this.setDataValue("pan_number", value.replace(/\D/g, ""));
          }
        },
      },

      pan_holder_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: {
            msg: "PAN holder name is required",
          },
          notEmpty: {
            msg: "PAN holder name cannot be empty",
          },
          len: {
            args: [2, 255],
            msg: "PAN holder name must be between 2 and 255 characters",
          },
        },
        set(value) {
          // Trim and normalize spaces
          if (value) {
            this.setDataValue(
              "pan_holder_name",
              value.trim().replace(/\s+/g, " "),
            );
          }
        },
      },

      vat_registered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: {
            msg: "VAT registration status is required",
          },
        },
      },

      vat_number: {
        type: DataTypes.STRING(9),
        allowNull: true,
        unique: {
          msg: "VAT number already exists",
        },
        validate: {
          len: {
            args: [9, 9],
            msg: "VAT number must be exactly 9 digits",
          },
          isNumeric: {
            msg: "VAT number must contain only digits",
          },
          isRequiredIfVatRegistered(value) {
            if (this.vat_registered && !value) {
              throw new Error("VAT number is required when VAT registered");
            }
          },
          matchesPan(value) {
            if (value && this.pan_number && value !== this.pan_number) {
              throw new Error("VAT number must match PAN number in Nepal");
            }
          },
        },
      },

      vat_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: "VAT rate cannot be negative",
          },
          max: {
            args: [100],
            msg: "VAT rate cannot exceed 100%",
          },
          isRequiredIfVatRegistered(value) {
            if (this.vat_registered && value === null) {
              throw new Error("VAT rate is required when VAT registered");
            }
          },
        },
      },

      tds_applicable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: {
            msg: "TDS applicability status is required",
          },
        },
      },

      tds_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: {
            args: [0],
            msg: "TDS rate cannot be negative",
          },
          max: {
            args: [100],
            msg: "TDS rate cannot exceed 100%",
          },
          isRequiredIfTdsApplicable(value) {
            if (this.tds_applicable && value === null) {
              throw new Error("TDS rate is required when TDS is applicable");
            }
          },
          isValidTdsRate(value) {
            if (value !== null) {
              const validRates = [0, 1.5, 2, 5, 10, 15];
              const rate = parseFloat(value);
              if (!validRates.includes(rate)) {
                throw new Error(
                  "TDS rate must be one of: 0%, 1.5%, 2%, 5%, 10%, 15%",
                );
              }
            }
          },
        },
      },

      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "VendorTaxDetail",
      tableName: "vendor_tax_details",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      // Model-level validations
      validate: {
        vatNumberEqualsPan() {
          if (this.vat_registered && this.vat_number !== this.pan_number) {
            throw new Error(
              "VAT number must be the same as PAN number in Nepal",
            );
          }
        },
      },

      // Hooks
      hooks: {
        beforeValidate: (instance) => {
          // Auto-populate VAT number from PAN if VAT registered
          if (instance.vat_registered && !instance.vat_number) {
            instance.vat_number = instance.pan_number;
          }

          // Auto-set VAT rate if VAT registered and no rate provided
          if (instance.vat_registered && !instance.vat_rate) {
            instance.vat_rate = 13.0;
          }

          // Clear VAT data if not VAT registered
          if (!instance.vat_registered) {
            instance.vat_number = null;
            instance.vat_rate = null;
          }

          // Clear TDS rate if not applicable
          if (!instance.tds_applicable) {
            instance.tds_rate = null;
          }
        },

        beforeCreate: (instance) => {
          // Convert PAN holder name to uppercase for consistency
          if (instance.pan_holder_name) {
            instance.pan_holder_name = instance.pan_holder_name.toUpperCase();
          }
        },

        beforeUpdate: (instance) => {
          // Convert PAN holder name to uppercase for consistency
          if (instance.pan_holder_name) {
            instance.pan_holder_name = instance.pan_holder_name.toUpperCase();
          }
        },
      },
    },
  );

  return VendorTaxDetail;
};
