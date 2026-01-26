"use strict";
const express = require("express");
const router = express.Router();
const PaymentBanking = require("../Controllers/Payment_BankingController");

// Page route
router.get("/PaymentBanking", PaymentBanking.paymentBankingManagement);

// Payment Banking CRUD routes
router.post("/PaymentBanking", PaymentBanking.createPaymentBanking);
router.get("/PaymentBanking/:id", PaymentBanking.getPaymentBankingById);
router.post("/PaymentBanking/:id", PaymentBanking.updatePaymentBanking);
router.post("/PaymentBanking/:id/delete", PaymentBanking.deletePaymentBanking);

module.exports = router;