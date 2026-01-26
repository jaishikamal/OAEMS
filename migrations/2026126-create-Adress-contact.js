"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Address_Contact_Details", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      registeredAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      district: {
        type: Sequelize.ENUM(
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
      },
      province: {
        type: Sequelize.ENUM(
          "Koshi",
          "Madhesh",
          "Bagmati",
          "Gandaki",
          "Lumbini",
          "Karnali",
          "Sudurpashchim"
        ),
        allowNull: false,
      },
      contactPerson: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      emailId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    // Add indexes
    await queryInterface.addIndex("Address_Contact_Details", ["district"]);
    await queryInterface.addIndex("Address_Contact_Details", ["province"]);
    await queryInterface.addIndex("Address_Contact_Details", ["emailId"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Address_Contact_Details");
  },
};