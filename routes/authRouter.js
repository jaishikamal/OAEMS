const express = require("express");
const authController = require("../Controllers/Auth");

const router = express.Router();

/**
 * GET /auth/login - Display login page
 */
router.get("/login", authController.login);

/**
 * POST /auth/login - Handle login submission
 */
router.post("/login", authController.postLogin);

/**
 * GET /auth/register - Display registration page
 */
router.get("/register", authController.register);

/**
 * POST /auth/register - Handle registration submission
 */
router.post("/register", authController.postRegister);

/**
 * GET /auth/logout - Handle logout
 */
router.get("/logout", authController.logout);

/**
 * GET /auth/me - Get current user info (API endpoint)
 */
router.get("/me", authController.checkAuth, authController.getCurrentUser);

module.exports = router;
