const express = require("express");
const router = express.Router();
const Account_Code_Group = require("../Controllers/Account_groupController");

// Page route
router.get("/AccountCodeGroup", Account_Code_Group.AccountCodeGroupManagement);

// Account code group CRUD routes
router.post("/AccountCodeGroup", Account_Code_Group.createAccountCodeGroup);
router.get("/AccountCodeGroup/:id", Account_Code_Group.getAccountCodeGroupById);
router.post("/AccountCodeGroup/:id", Account_Code_Group.updateAccountCodeGroup); // Changed to POST
router.post(
  "/AccountCodeGroup/:id/delete",
  Account_Code_Group.deleteAccountCodeGroup
); // Changed to POST with /delete

module.exports = router;
