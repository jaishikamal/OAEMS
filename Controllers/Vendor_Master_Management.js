const { Vendor_Identification } = require("../models");

// Page rendering function to get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor_Identification.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.render("pages/Vendor_Identification_Details", {
      pageTitle: "Vendor Details",
      layout: "main",
      vendors,
      success: req.query.success,
      error: req.query.error,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).render("error", {
      error: "Failed to load vendors",
      message: error.message,
    });
  }
};

// Helper: generate a unique 6-digit vendor ID
async function generateUniqueVendorId() {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await Vendor_Identification.findOne({
      where: { vendorId: candidate },
    });
    if (!exists) return candidate;
  }
  // Fallback: use last 6 digits of timestamp padded
  return (Date.now() % 1000000).toString().padStart(6, "0");
}

// auto-generate vendor ID by 6 digits random number (ensures uniqueness)
exports.generatedVendorID = async (req, res) => {
  try {
    const VendorID = await generateUniqueVendorId();
    res.send(VendorID);
  } catch (err) {
    console.error("Error generating vendor ID:", err);
    res.status(500).send("000000");
  }
};

// Create a new vendor
exports.createVendor = async (req, res) => {
  try {
    const {
      vendorId: providedVendorId,
      vendorLegalName,
      tradeName,
      vendorType,
      vendorCategory,
      country,
      status,
    } = req.body;

    // Validate trade name is required
    if (!tradeName) {
      return res.redirect(
        "/Vendor?error=" + encodeURIComponent("Trade Name is required"),
      );
    }

    // validate vendor type
    if (!vendorType && !vendorCategory) {
      return res.redirect(
        "/Vendor?error=" +
          encodeURIComponent("Vendor Type or Category is required"),
      );
    }

    // Determine vendorId (generate if not provided)
    let vendorId = providedVendorId;
    if (!vendorId || vendorId.toString().trim() === "") {
      vendorId = await generateUniqueVendorId();
    } else {
      // Ensure provided vendorId is a 6-digit number
      if (!/^\d{6}$/.test(vendorId.toString())) {
        return res.redirect(
          "/Vendor?error=" +
            encodeURIComponent("Vendor ID must be a 6-digit number"),
        );
      }
    }

    // Check if vendorId already exists
    const existingVendor = await Vendor_Identification.findOne({
      where: { vendorId },
    });

    if (existingVendor) {
      return res.redirect(
        "/Vendor?error=" + encodeURIComponent("Vendor ID already exists"),
      );
    }

    await Vendor_Identification.create({
      vendorId,
      vendorLegalName: vendorLegalName || null,
      tradeName,
      vendorType: vendorType || null,
      vendorCategory: vendorCategory || null,
      country: country || "Nepal",
      status: status || "Draft",
    });

    res.redirect(
      "/Vendor?success=" + encodeURIComponent("Vendor created successfully"),
    );
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.redirect("/Vendor?error=" + encodeURIComponent(error.message));
  }
};

// Update vendor
exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vendorLegalName,
      tradeName,
      vendorType,
      vendorCategory,
      country,
      status,
    } = req.body;

    const vendor = await Vendor_Identification.findByPk(id);

    if (!vendor) {
      return res.redirect(
        "/Vendor?error=" + encodeURIComponent("Vendor not found"),
      );
    }

    // Validate trade name is not empty
    if (!tradeName || tradeName.trim() === "") {
      return res.redirect(
        "/Vendor?error=" + encodeURIComponent("Trade Name is required"),
      );
    }

    await vendor.update({
      vendorLegalName: vendorLegalName || null,
      tradeName: tradeName,
      vendorType: vendorType || null,
      vendorCategory: vendorCategory || null,
      country: country || vendor.country,
      status: status || vendor.status,
    });

    res.redirect(
      "/Vendor?success=" + encodeURIComponent("Vendor updated successfully"),
    );
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.redirect("/Vendor?error=" + encodeURIComponent(error.message));
  }
};

// Delete vendor
exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor_Identification.findByPk(id);

    if (!vendor) {
      return res.redirect(
        "/Vendor?error=" + encodeURIComponent("Vendor not found"),
      );
    }

    await vendor.destroy();

    res.redirect(
      "/Vendor?success=" + encodeURIComponent("Vendor deleted successfully"),
    );
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.redirect("/Vendor?error=" + encodeURIComponent(error.message));
  }
};

// Get vendors by status (API endpoint)
exports.getVendorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const vendors = await Vendor_Identification.findAll({
      where: { status },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: vendors,
      count: vendors.length,
    });
  } catch (error) {
    console.error("Error fetching vendors by status:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get vendors by type (API endpoint)
exports.getVendorsByType = async (req, res) => {
  try {
    const { vendorType } = req.params;

    const vendors = await Vendor_Identification.findAll({
      where: { vendorType },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: vendors,
      count: vendors.length,
    });
  } catch (error) {
    console.error("Error fetching vendors by type:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get vendors by category (API endpoint)
exports.getVendorsByCategory = async (req, res) => {
  try {
    const { vendorCategory } = req.params;

    const vendors = await Vendor_Identification.findAll({
      where: { vendorCategory },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: vendors,
      count: vendors.length,
    });
  } catch (error) {
    console.error("Error fetching vendors by category:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update vendor status (API endpoint)
exports.updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const vendor = await Vendor_Identification.findByPk(id);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    await vendor.update({ status });

    res.status(200).json({
      success: true,
      data: vendor,
      message: "Vendor status updated successfully",
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res.status(500).json({ error: error.message });
  }
};

//
