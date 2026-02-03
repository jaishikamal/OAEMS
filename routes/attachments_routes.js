// Routes: Attachments
// Filename: attachments.js

const express = require("express");
const router = express.Router();
const AttachmentsController = require("../controllers/Attachement");
const upload = require("../config/multerconfig"); // Your existing multer config

// View attachments management page
router.get("/Attachments", AttachmentsController.AttachmentsManagement);

// API: Check if attachment exists
router.get(
  "/api/attachments/check",
  AttachmentsController.checkAttachmentExists,
);

// API: Get attachments count
router.get("/api/attachments/count", AttachmentsController.getAttachmentsCount);

// API: Get attachment by ID
router.get("/api/attachments/:id", AttachmentsController.getAttachmentById);

// Create/Upload attachment
router.post(
  "/Attachments",
  upload.single("attachment_file"),
  AttachmentsController.createAttachment,
);

// Update attachment
router.post(
  "/Attachments/:id",
  upload.single("attachment_file"),
  AttachmentsController.updateAttachment,
);

// Download attachment
router.get("/Attachments/:id/download", AttachmentsController.downloadAttachment);

// Delete attachment
router.post("/Attachments/:id/delete", AttachmentsController.deleteAttachment);

module.exports = router;
