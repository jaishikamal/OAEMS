"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AddressContactDetail extends Model {
    static associate(models) {
      // Add associations here if needed
    }
  }

  AddressContactDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      registeredAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: { msg: "Registered Address is required" },
          notEmpty: { msg: "Registered Address cannot be empty" },
        },
      },
      district: {
        type: DataTypes.ENUM(
          "Achham",
          "Arghakhanchi",
          "Baglung",
          "Baitadi",
          "Bajhang",
          "Bajura",
          "Banke",
          "Bara",
          "Bardiya",
          "Bhaktapur",
          "Bhojpur",
          "Chitwan",
          "Dadeldhura",
          "Dailekh",
          "Dang",
          "Darchula",
          "Dhading",
          "Dhankuta",
          "Dhanusa",
          "Dolakha",
          "Dolpa",
          "Doti",
          "Gorkha",
          "Gulmi",
          "Humla",
          "Ilam",
          "Jajarkot",
          "Jhapa",
          "Jumla",
          "Kailali",
          "Kalikot",
          "Kanchanpur",
          "Kapilvastu",
          "Kaski",
          "Kathmandu",
          "Kavrepalanchok",
          "Khotang",
          "Lalitpur",
          "Lamjung",
          "Mahottari",
          "Makwanpur",
          "Manang",
          "Morang",
          "Mugu",
          "Mustang",
          "Myagdi",
          "Nawalparasi East",
          "Nawalparasi West",
          "Nuwakot",
          "Okhaldhunga",
          "Palpa",
          "Panchthar",
          "Parbat",
          "Parsa",
          "Pyuthan",
          "Ramechhap",
          "Rasuwa",
          "Rautahat",
          "Rolpa",
          "Rukum East",
          "Rukum West",
          "Rupandehi",
          "Salyan",
          "Sankhuwasabha",
          "Saptari",
          "Sarlahi",
          "Sindhuli",
          "Sindhupalchok",
          "Siraha",
          "Solukhumbu",
          "Sunsari",
          "Surkhet",
          "Syangja",
          "Tanahu",
          "Taplejung",
          "Terhathum",
          "Udayapur"
        ),
        allowNull: false,
        validate: {
          notNull: { msg: "District is required" },
          notEmpty: { msg: "District cannot be empty" },
        },
      },
      province: {
        type: DataTypes.ENUM(
          "Koshi",
          "Madhesh",
          "Bagmati",
          "Gandaki",
          "Lumbini",
          "Karnali",
          "Sudurpashchim"
        ),
        allowNull: false,
        validate: {
          notNull: { msg: "Province is required" },
          notEmpty: { msg: "Province cannot be empty" },
        },
      },
      contactPerson: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: {
            args: /^[0-9+\-() ]*$/i,
            msg: "Phone number can only contain numbers and +, -, (, ) characters",
          },
        },
      },
      emailId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: {
            msg: "Please provide a valid email address",
          },
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "AddressContactDetail",
      tableName: "Address_Contact_Details",
      timestamps: true,
      paranoid: true,
    }
  );

  return AddressContactDetail;
};