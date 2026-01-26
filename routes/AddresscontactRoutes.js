"use strict";
const express = require("express");
const router = express.Router();
const AddressContact = require("../Controllers/AddressContactController");

// Page route
router.get("/AddressContact", AddressContact.addressContactManagement);

// Address Contact CRUD routes
router.post("/AddressContact", AddressContact.createAddressContact);
router.get("/AddressContact/:id", AddressContact.getAddressContactById);
router.post("/AddressContact/:id", AddressContact.updateAddressContact);
router.post("/AddressContact/:id/delete", AddressContact.deleteAddressContact);

module.exports = router;
