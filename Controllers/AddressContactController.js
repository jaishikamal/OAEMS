"use strict";
const { AddressContactDetail } = require("../models");

// Define districts by province for frontend use
const districtsByProvince = {
  Koshi: [
    "Bhojpur",
    "Dhankuta",
    "Ilam",
    "Jhapa",
    "Khotang",
    "Morang",
    "Okhaldhunga",
    "Panchthar",
    "Sankhuwasabha",
    "Solukhumbu",
    "Sunsari",
    "Taplejung",
    "Terhathum",
    "Udayapur",
  ],
  Madhesh: [
    "Bara",
    "Dhanusa",
    "Mahottari",
    "Parsa",
    "Rautahat",
    "Saptari",
    "Sarlahi",
    "Siraha",
  ],
  Bagmati: [
    "Bhaktapur",
    "Chitwan",
    "Dhading",
    "Dolakha",
    "Kathmandu",
    "Kavrepalanchok",
    "Lalitpur",
    "Makwanpur",
    "Nuwakot",
    "Ramechhap",
    "Rasuwa",
    "Sindhuli",
    "Sindhupalchok",
  ],
  Gandaki: [
    "Baglung",
    "Gorkha",
    "Kaski",
    "Lamjung",
    "Manang",
    "Mustang",
    "Myagdi",
    "Nawalparasi East",
    "Parbat",
    "Syangja",
    "Tanahu",
  ],
  Lumbini: [
    "Arghakhanchi",
    "Banke",
    "Bardiya",
    "Dang",
    "Gulmi",
    "Kapilvastu",
    "Nawalparasi West",
    "Palpa",
    "Pyuthan",
    "Rolpa",
    "Rukum East",
    "Rupandehi",
  ],
  Karnali: [
    "Dailekh",
    "Dolpa",
    "Humla",
    "Jajarkot",
    "Jumla",
    "Kalikot",
    "Mugu",
    "Rukum West",
    "Salyan",
    "Surkhet",
  ],
  Sudurpashchim: [
    "Achham",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Dadeldhura",
    "Darchula",
    "Doti",
    "Kailali",
    "Kanchanpur",
  ],
};

exports.addressContactManagement = async (req, res) => {
  try {
    const addressContacts = await AddressContactDetail.findAll({
      order: [["id", "DESC"]],
    });

    res.render("pages/AddressContact", {
      pageTitle: "Address and Contact Details Management",
      layout: "main",
      addressContacts,
      districtsByProvince: JSON.stringify(districtsByProvince),
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error(error);
    res.render("pages/AddressContact", {
      addressContacts: [],
      districtsByProvince: JSON.stringify(districtsByProvince),
      error: "Failed to load data",
    });
  }
};

// Create address contact detail
exports.createAddressContact = async (req, res) => {
  try {
    const {
      registeredAddress,
      district,
      province,
      contactPerson,
      phoneNumber,
      emailId,
    } = req.body;

    // Validate required fields
    if (!registeredAddress || !registeredAddress.trim()) {
      return res.redirect(
        "/AddressContact?error=Registered Address is required"
      );
    }

    if (!district) {
      return res.redirect("/AddressContact?error=District is required");
    }

    if (!province) {
      return res.redirect("/AddressContact?error=Province is required");
    }

    // Validate email format if provided
    if (emailId && emailId.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailId.trim())) {
        return res.redirect("/AddressContact?error=Invalid email format");
      }
    }

    // Validate phone number format if provided
    if (phoneNumber && phoneNumber.trim()) {
      const phoneRegex = /^[0-9+\-() ]*$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        return res.redirect(
          "/AddressContact?error=Invalid phone number format"
        );
      }
    }

    await AddressContactDetail.create({
      registeredAddress: registeredAddress.trim(),
      district,
      province,
      contactPerson: contactPerson?.trim() || null,
      phoneNumber: phoneNumber?.trim() || null,
      emailId: emailId?.trim() || null,
    });

    res.redirect(
      "/AddressContact?success=Address and Contact Details created successfully"
    );
  } catch (error) {
    console.error("Error creating address contact:", error);
    res.redirect(
      "/AddressContact?error=" +
        (error.message || "Failed to create address contact detail")
    );
  }
};

// Get address contact detail by ID (API endpoint)
exports.getAddressContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const addressContact = await AddressContactDetail.findByPk(id);

    if (!addressContact) {
      return res.status(404).json({
        success: false,
        message: "Address and Contact Detail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: addressContact,
    });
  } catch (error) {
    console.error("Error fetching address contact:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update address contact detail
exports.updateAddressContact = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      registeredAddress,
      district,
      province,
      contactPerson,
      phoneNumber,
      emailId,
    } = req.body;

    // Validate required fields
    if (!registeredAddress || !registeredAddress.trim()) {
      return res.redirect(
        "/AddressContact?error=Registered Address is required"
      );
    }

    if (!district) {
      return res.redirect("/AddressContact?error=District is required");
    }

    if (!province) {
      return res.redirect("/AddressContact?error=Province is required");
    }

    const addressContact = await AddressContactDetail.findByPk(id);

    if (!addressContact) {
      return res.redirect(
        "/AddressContact?error=Address and Contact Detail not found"
      );
    }

    // Validate email format if provided
    if (emailId && emailId.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailId.trim())) {
        return res.redirect("/AddressContact?error=Invalid email format");
      }
    }

    // Validate phone number format if provided
    if (phoneNumber && phoneNumber.trim()) {
      const phoneRegex = /^[0-9+\-() ]*$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        return res.redirect(
          "/AddressContact?error=Invalid phone number format"
        );
      }
    }

    await addressContact.update({
      registeredAddress: registeredAddress.trim(),
      district,
      province,
      contactPerson: contactPerson?.trim() || null,
      phoneNumber: phoneNumber?.trim() || null,
      emailId: emailId?.trim() || null,
    });

    res.redirect(
      "/AddressContact?success=Address and Contact Details updated successfully"
    );
  } catch (error) {
    console.error("Error updating address contact:", error);
    res.redirect(
      "/AddressContact?error=Failed to update address contact detail"
    );
  }
};

// Delete address contact detail
exports.deleteAddressContact = async (req, res) => {
  try {
    const { id } = req.params;
    const addressContact = await AddressContactDetail.findByPk(id);

    if (!addressContact) {
      return res.redirect(
        "/AddressContact?error=Address and Contact Detail not found"
      );
    }

    await addressContact.destroy();
    res.redirect(
      "/AddressContact?success=Address and Contact Details deleted successfully"
    );
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.redirect(
        "/AddressContact?error=Cannot delete: Address contact is used in other records"
      );
    }
    console.error("Error deleting address contact:", error);
    res.redirect(
      "/AddressContact?error=Failed to delete address contact detail"
    );
  }
};