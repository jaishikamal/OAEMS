const { Attachment } = require("../models");
const fs = require("fs");
const path = require("path");

// Attachments Management page
exports.AttachmentsManagement = async (req, res) => {
  try {
    // Get all attachments
    const attachments = await Attachment.findAll({
      order: [["created_at", "DESC"]],
    });

    // Define attachment types with mandatory status
    const attachmentTypes = [
      { name: "PAN Certificate", mandatory: true },
      { name: "VAT Certificate", mandatory: false }, // Conditional
      { name: "Bank Cheque / Letter", mandatory: true },
      { name: "Contract / Agreement", mandatory: false },
    ];

    res.render("pages/Attachments", {
      pageTitle: "Attachments Management",
      layout: "main",
      attachments,
      attachmentTypes,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.render("pages/Attachments", {
      pageTitle: "Attachments Management",
      layout: "main",
      attachments: [],
      attachmentTypes: [],
      error: "Failed to load attachments",
    });
  }
};

// Check if attachment type already exists (API endpoint)
exports.checkAttachmentExists = async (req, res) => {
  try {
    const { attachment_type } = req.query;

    if (!attachment_type) {
      return res.status(400).json({
        success: false,
        message: "Attachment type is required",
      });
    }

    const existing = await Attachment.findOne({
      where: {
        attachment_type,
      },
    });

    if (existing) {
      return res.status(200).json({
        success: false,
        exists: true,
        message: "This attachment type already exists",
        existingFile: existing.file_path,
      });
    }

    res.status(200).json({
      success: true,
      exists: false,
    });
  } catch (error) {
    console.error("Error checking attachment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Upload/Create attachment
exports.createAttachment = async (req, res) => {
  try {
    const { attachment_type } = req.body;

    // Validate required fields
    if (!attachment_type) {
      // Delete uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.redirect("/Attachments?error=Attachment type is required");
    }

    if (!req.file) {
      return res.redirect("/Attachments?error=No file uploaded");
    }

    // Check if attachment type already exists
    const existing = await Attachment.findOne({
      where: {
        attachment_type,
      },
    });

    if (existing) {
      // Delete uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.redirect(
        "/Attachments?error=This attachment type already exists. Please delete the existing one first or use update.",
      );
    }

    // Determine if mandatory
    const mandatoryTypes = ["PAN Certificate", "Bank Cheque / Letter"];
    const isMandatory = mandatoryTypes.includes(attachment_type);

    // Store relative path from project root
    const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path separators

    // Create new attachment
    await Attachment.create({
      attachment_type: attachment_type,
      file_path: filePath,
      is_mandatory: isMandatory,
      uploaded_at: new Date(),
    });

    res.redirect(
      "/Attachments?success=Attachment uploaded successfully: " +
        attachment_type,
    );
  } catch (error) {
    console.error("Error uploading attachment:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.redirect(
      "/Attachments?error=" + (error.message || "Failed to upload attachment"),
    );
  }
};

// Get attachment by ID (API endpoint)
exports.getAttachmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    console.error("Error fetching attachment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update/Replace attachment
exports.updateAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { attachment_type } = req.body;

    // Validate required fields
    if (!attachment_type) {
      // Delete uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.redirect("/Attachments?error=Attachment type is required");
    }

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      // Delete uploaded file if exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.redirect("/Attachments?error=Attachment not found");
    }

    // Check if changing to a different type that already exists
    const { Op } = require("sequelize");
    if (attachment_type !== attachment.attachment_type) {
      const existing = await Attachment.findOne({
        where: {
          attachment_type,
          id: { [Op.ne]: id },
        },
      });

      if (existing) {
        // Delete uploaded file if exists
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.redirect(
          "/Attachments?error=Cannot change to this type: already exists",
        );
      }
    }

    // Determine if mandatory
    const mandatoryTypes = ["PAN Certificate", "Bank Cheque / Letter"];
    const isMandatory = mandatoryTypes.includes(attachment_type);

    // Update attachment
    const updateData = {
      attachment_type: attachment_type,
      is_mandatory: isMandatory,
    };

    // If new file uploaded, delete old file and update path
    if (req.file) {
      // Delete old file - use absolute path
      const oldFilePath = path.resolve(attachment.file_path);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (err) {
          console.error("Error deleting old file:", err);
        }
      }

      // Store new file path (normalized)
      updateData.file_path = req.file.path.replace(/\\/g, '/');
      updateData.uploaded_at = new Date();
    }

    await attachment.update(updateData);

    res.redirect(
      "/Attachments?success=Attachment updated successfully: " +
        attachment_type,
    );
  } catch (error) {
    console.error("Error updating attachment:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.redirect(
      "/Attachments?error=" + (error.message || "Failed to update attachment"),
    );
  }
};

// Download attachment
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.redirect("/Attachments?error=Attachment not found");
    }

    // Use absolute path
    const filePath = path.resolve(attachment.file_path);

    if (!fs.existsSync(filePath)) {
      return res.redirect("/Attachments?error=File not found on server: " + attachment.file_path);
    }

    // Extract original filename from path
    const fileName = path.basename(attachment.file_path);
    res.download(filePath, fileName);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    res.redirect("/Attachments?error=Failed to download attachment");
  }
};

// Delete attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      return res.redirect("/Attachments?error=Attachment not found");
    }

    // Delete file from disk - use absolute path
    const filePath = path.resolve(attachment.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file from disk:", err);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    await attachment.destroy();

    res.redirect(
      "/Attachments?success=Attachment deleted successfully: " +
        attachment.attachment_type,
    );
  } catch (error) {
    console.error("Error deleting attachment:", error);
    res.redirect(
      "/Attachments?error=" + (error.message || "Failed to delete attachment"),
    );
  }
};

// Get attachments count (API endpoint)
exports.getAttachmentsCount = async (req, res) => {
  try {
    const count = await Attachment.count();

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Error fetching attachments count:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};