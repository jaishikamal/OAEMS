//BASE_URL
const BASE_URL = "https://oprsk.bizengineconsulting.com/api";

// Get all roles and render the page
exports.getRoles = async (req, res) => {
  try {
    // Enable login check
    if (!req.session || !req.session.token) {
      console.log("No session or token, redirecting to login");
      return res.redirect("/");
    }

    const token = req.session.token;

    // Fetch roles from external API
    const getListResponse = await fetch(`${BASE_URL}/admin/roles?per_page=100`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("Fetch roles response status:", getListResponse.status);

    // Check if the response is successful
    if (!getListResponse.ok) {
      // Handle 401 - Unauthorized
      if (getListResponse.status === 401) {
        console.log("Unauthorized (401), clearing session and redirecting to login");
        req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
        });
        return res.redirect("/");
      }
      throw new Error(`API responded with status: ${getListResponse.status}`);
    }

    const rolesData = await getListResponse.json();
    console.log("Fetched roles data:", rolesData);

    // Render the roles page
    res.render("pages/RoleManagement", {
      pageTitle: "Roles",
      layout: "main",
      roles: rolesData.data.data || [],
    });
  } catch (error) {
    console.error("Error in getRoles:", error);
    res.status(500).send("An error occurred while fetching roles.");
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  try {
    console.log("Create role request body:", req.body);

    // Validate session
    if (!req.session || !req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const { name, description, permissions } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one permission is required",
      });
    }

    const token = req.session.token;

    const createRoleResponse = await fetch(`${BASE_URL}/admin/roles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        description: description ? description.trim() : "",
        permissions
      }),
    });

    console.log("Create role response status:", createRoleResponse.status);

    const roleData = await createRoleResponse.json();
    console.log("Created role data:", roleData);

    if (!createRoleResponse.ok) {
      // Handle 401 - Unauthorized
      if (createRoleResponse.status === 401) {
        return res.status(401).json({
          success: false,
          message: "Session expired - Please login again",
        });
      }
      return res.status(createRoleResponse.status).json({
        success: false,
        message: roleData.message || "Failed to create role",
        error: roleData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role created successfully",
      data: roleData,
    });
  } catch (error) {
    console.error("Error in createRole:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating role",
      error: error.message,
    });
  }
};

// Get a single role by ID
exports.getRoleById = async (req, res) => {
  try {
    // Validate session
    if (!req.session || !req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const roleId = req.params.id;
    const token = req.session.token;

    console.log(`Fetching role with ID: ${roleId}`);

    const getRoleResponse = await fetch(`${BASE_URL}/admin/roles/${roleId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("Get role response status:", getRoleResponse.status);

    const roleData = await getRoleResponse.json();
    console.log("Fetched role data:", roleData);

    if (!getRoleResponse.ok) {
      // Handle 401 - Unauthorized
      if (getRoleResponse.status === 401) {
        return res.status(401).json({
          success: false,
          message: "Session expired - Please login again",
        });
      }
      return res.status(getRoleResponse.status).json({
        success: false,
        message: roleData.message || "Failed to fetch role",
        error: roleData,
      });
    }

    return res.status(200).json({
      success: true,
      data: roleData.data || roleData,
    });
  } catch (error) {
    console.error("Error in getRoleById:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching role",
      error: error.message,
    });
  }
};

// Update a role - FIXED: Now handles POST from frontend but sends PUT to API
exports.updateRole = async (req, res) => {
  try {
    console.log("Update role request body:", req.body);
    console.log("Update role ID:", req.params.id);

    // Validate session
    if (!req.session || !req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const roleId = req.params.id;
    const { name, description, permissions } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one permission is required",
      });
    }

    const token = req.session.token;

    // Send PUT request to external API (this is correct)
    const updateRoleResponse = await fetch(`${BASE_URL}/admin/roles/${roleId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        description: description ? description.trim() : "",
        permissions
      }),
    });

    console.log("Update role response status:", updateRoleResponse.status);

    const roleData = await updateRoleResponse.json();
    console.log("Updated role data:", roleData);

    if (!updateRoleResponse.ok) {
      // Handle 401 - Unauthorized
      if (updateRoleResponse.status === 401) {
        return res.status(401).json({
          success: false,
          message: "Session expired - Please login again",
        });
      }
      return res.status(updateRoleResponse.status).json({
        success: false,
        message: roleData.message || "Failed to update role",
        error: roleData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: roleData,
    });
  } catch (error) {
    console.error("Error in updateRole:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating role",
      error: error.message,
    });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  try {
    console.log("Delete role ID:", req.params.id);

    // Validate session
    if (!req.session || !req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const roleId = req.params.id;
    const token = req.session.token;

    const deleteRoleResponse = await fetch(`${BASE_URL}/admin/roles/${roleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("Delete role response status:", deleteRoleResponse.status);

    // Some APIs return 204 No Content on successful delete
    if (deleteRoleResponse.status === 204) {
      return res.status(200).json({
        success: true,
        message: "Role deleted successfully",
      });
    }

    const responseData = await deleteRoleResponse.json();
    console.log("Delete role response data:", responseData);

    if (!deleteRoleResponse.ok) {
      // Handle 401 - Unauthorized
      if (deleteRoleResponse.status === 401) {
        return res.status(401).json({
          success: false,
          message: "Session expired - Please login again",
        });
      }
      return res.status(deleteRoleResponse.status).json({
        success: false,
        message: responseData.message || "Failed to delete role",
        error: responseData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error in deleteRole:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting role",
      error: error.message,
    });
  }
};