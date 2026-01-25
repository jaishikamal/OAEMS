module.exports = (sequelize, DataTypes) => {
  const VendorIdentification = sequelize.define(
    "Vendor_Identification",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      vendorId: {
        type: DataTypes.STRING(20),
        allowNull: true, // ← Changed to match migration
        unique: true,
      },
      vendorLegalName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tradeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vendorType: {
        type: DataTypes.ENUM("Individual", "Company", "Government"),
        allowNull: false, // ← Changed to match migration
      },
      vendorCategory: {
        type: DataTypes.ENUM(
          "Stationery",
          "Travel",
          "IT",
          "Consulting",
          "Equipment",
          "Services",
          "Other",
        ),
        allowNull: false, // ← Changed to match migration
      },
      country: {
        type: DataTypes.ENUM("Nepal", "Foreign"),
        allowNull: false,
        defaultValue: "Nepal",
      },
      status: {
        type: DataTypes.ENUM(
          "Draft",
          "Pending",
          "Active",
          "Inactive",
          "Rejected",
        ),
        allowNull: true, // ← Changed to match migration
        defaultValue: "Draft",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "Vendor_Identification",
      timestamps: true,
       
    },
  );

  // ← Added associate method
  VendorIdentification.associate = function(models) {
    VendorIdentification.hasOne(models.VendorTaxDetail, {
      foreignKey: "vendor_id",
      as: "taxDetails",
    });
  };

  return VendorIdentification;
};