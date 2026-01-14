const express = require("express");
const router = express.Router();
const Account_Code_Group = require("../Controllers/Account_groupController");

//page route
router.get("/AccountCodeGroup", Account_Code_Group.AccountCodeGroupManagement);

//  account code group crud routes
router.post("/account-code-groups", Account_Code_Group.createAccountCodeGroup);
router.get("/account-code-groups/:id", Account_Code_Group.getAccountCodeGroupById);
router.put("/account-code-groups/:id", Account_Code_Group.updateAccountCodeGroup);
router.delete("/account-code-groups/:id", Account_Code_Group.deleteAccountCodeGroup);

module.exports = router;