const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const BASE_URL = "https://oprsk.bizengineconsulting.com/api";

// Main page render
exports.userManagement = async (req, res) => {
  try {
    // Login check - UNCOMMENT THIS!
    if (!req.session.token) {
      return res.redirect("/");
    }
    const token = req.session.token;

    // Fetch users, roles, permissions, branches, and departments in parallel
    const [
      usersResponse,
      rolesResponse,
      permissionsResponse,
      branchesResponse,
      riskAreasResponse,
    ] = await Promise.all([
      fetch(`${BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
      fetch(`${BASE_URL}/admin/roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
      fetch(`${BASE_URL}/admin/permissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
      fetch(`${BASE_URL}/branches`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }),
      fetch(`${BASE_URL}/kri/risk-areas`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch((err) => {
        console.log("Risk areas endpoint not available, using fallback");
        return { ok: false, json: async () => ({ data: { items: [] } }) };
      }),
    ]);

    // Check if any critical API call failed
    if (!usersResponse.ok || !rolesResponse.ok || !permissionsResponse.ok || !branchesResponse.ok) {
      console.error("One or more API calls failed");
      console.error("Users:", usersResponse.status);
      console.error("Roles:", rolesResponse.status);
      console.error("Permissions:", permissionsResponse.status);
      console.error("Branches:", branchesResponse.status);
      
      // If unauthorized, redirect to login
      if (usersResponse.status === 401 || rolesResponse.status === 401) {
        return res.redirect("/");
      }
      
      throw new Error("Failed to fetch data from API");
    }

    const usersData = await usersResponse.json();
    const rolesData = await rolesResponse.json();
    const permissionsData = await permissionsResponse.json();
    const branchesData = await branchesResponse.json();
    const riskAreasData = riskAreasResponse.ok
      ? await riskAreasResponse.json()
      : { data: { items: [] } };

    // Safely access nested data with fallbacks
    const users = (usersData?.data?.data || []).map((user) => {
      // ... rest of your mapping code stays the same
      let branchId = null;
      let branchName = null;

      if (user.branch_id) {
        branchId = user.branch_id;
        const branch = (branchesData.data?.data || []).find(
          (b) => b.id == branchId
        );
        if (branch) branchName = branch.name;
      } else if (user.branches && user.branches.length > 0) {
        branchId = user.branches[0].id;
        branchName = user.branches[0].name;
      } else if (user.branch) {
        branchId = user.branch.id;
        branchName = user.branch.name;
      }

      let departmentId = user.department_id
        ? parseInt(user.department_id, 10)
        : null;
      let departmentName = null;

      if (
        user.department &&
        typeof user.department === "object" &&
        user.department.id
      ) {
        departmentId = parseInt(user.department.id, 10);
        departmentName = user.department.title || user.department.name;
      }
      else if (
        user.department &&
        typeof user.department === "string" &&
        user.department.trim() !== ""
      ) {
        departmentName = user.department.trim();
      }
      else if (departmentId && riskAreasData?.data?.items?.length > 0) {
        const dept = riskAreasData.data.items.find((d) => {
          const deptId = parseInt(d.id, 10);
          return deptId === departmentId;
        });
        if (dept) {
          departmentName = dept.title;
        }
      }

      return {
        ...user,
        branch_id: branchId,
        branch_name: branchName,
        department_id: departmentId,
        department_name: departmentName || "",
      };
    });

    const activeUsers = users.filter((u) => u.is_active).length;
    const pendingUsers = users.filter((u) => u.status === "Pending").length;
    const adminUsers = users.filter(
      (u) => u.roles && u.roles.some((r) => r.name === "Administrator")
    ).length;

    return res.render("pages/user_management", {
      pageTitle: "User Management",
      layout: "main",
      users: users,
      roles: rolesData?.data?.data || [],
      permissions: permissionsData?.data?.data || [],
      branches: branchesData?.data?.data || [],
      departments: riskAreasData?.data?.items || [],
      totalUsers: usersData?.data?.total || users.length,
      activeUsers: activeUsers,
      pendingUsers: pendingUsers,
      adminUsers: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user management data",
      error: error.message,
    });
  }
};

// Create user - FIXED TO SEND department_id
exports.createUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log("Creating user with data:", req.body);

    // Validate required fields
    if (!req.body.branch_id) {
      return res.status(400).json({
        success: false,
        message: "Branch is required",
      });
    }

    if (!req.body.department_id || req.body.department_id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    const token = req.session.token;
    const departmentId = parseInt(req.body.department_id, 10);

    // Transform frontend data to API format
    // The API expects department_id as an integer, not department as string
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || "TempPass123!",
      department_id: departmentId, // Send department_id instead of department
      branch_ids: [parseInt(req.body.branch_id, 10)],
      is_active: req.body.status === "Active",
      notes: req.body.notes || "",
      two_factor_enabled: req.body.two_factor || false,
    };

    console.log("Sending to API:", userData);

    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("API Response:", data);

    if (!response.ok || !data.success) {
      return res.status(response.status || 400).json({
        success: false,
        message: data.message || "Error creating user",
        error: data.error || null,
      });
    }

    // If user created successfully and role specified, assign role
    if (data.success && req.body.role && data.data?.id) {
      console.log("Assigning role:", req.body.role);
      try {
        const roleResponse = await fetch(
          `${BASE_URL}/admin/users/${data.data.id}/roles`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: req.body.role }),
          }
        );

        const roleData = await roleResponse.json();
        console.log("Role assignment response:", roleData);
      } catch (roleError) {
        console.error("Error assigning role (non-fatal):", roleError);
        // Don't fail the entire request if role assignment fails
      }
    }

    return res.json({
      success: true,
      message: data.message || "User created successfully",
      data: data.data,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

// Update user - FIXED TO SEND department_id
exports.updateUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const token = req.session.token;

    // Validate department if provided
    if (req.body.department_id && req.body.department_id.trim() === "N/A") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid department",
      });
    }

    // Transform frontend data to API format
    const userData = {
      name: req.body.name,
      email: req.body.email,
      is_active: req.body.status === "Active",
      two_factor_enabled: req.body.two_factor || false,
    };

    // Handle department update - send department_id as integer
    if (
      req.body.department_id &&
      req.body.department_id.trim() !== "" &&
      req.body.department_id !== "N/A"
    ) {
      userData.department_id = parseInt(req.body.department_id, 10);
    }

    // Only add notes if provided
    if (req.body.notes && req.body.notes.trim() !== "") {
      userData.notes = req.body.notes.trim();
    }

    // Add branch_ids if provided
    if (req.body.branch_id) {
      userData.branch_ids = [parseInt(req.body.branch_id, 10)];
    }

    console.log("Updating user", id, "with data:", userData);

    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Update response:", data);

    if (!response.ok || !data.success) {
      return res.status(response.status || 400).json({
        success: false,
        message: data.message || "Error updating user",
        error: data.error || null,
      });
    }

    // If role specified, update role
    if (data.success && req.body.role) {
      console.log("Updating role to:", req.body.role);
      try {
        const roleResponse = await fetch(
          `${BASE_URL}/admin/users/${id}/roles`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: req.body.role }),
          }
        );

        const roleData = await roleResponse.json();
        console.log("Role update response:", roleData);
      } catch (roleError) {
        console.error("Error updating role (non-fatal):", roleError);
        // Don't fail the entire request if role update fails
      }
    }

    return res.json({
      success: true,
      message: data.message || "User updated successfully",
      data: data.data,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${req.session.token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    return res.json({
      success: data.success || response.ok,
      message: data.message || "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// Assign role to user
exports.assignRole = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userId } = req.params;
    const response = await fetch(`${BASE_URL}/admin/users/${userId}/roles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${req.session.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    return res.json({
      success: data.success || response.ok,
      message: data.message || "Role assigned successfully",
      data: data.data,
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while assigning role",
    });
  }
};

// Get role permissions
exports.getRolePermissions = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { roleId } = req.params;
    const response = await fetch(
      `${BASE_URL}/admin/roles/${roleId}/permissions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${req.session.token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();

    return res.json({
      success: data.success || response.ok,
      data: data.data || data,
      permissions: data.data?.permissions || [],
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching permissions",
    });
  }
};

// Bulk assign role to multiple users
exports.bulkAssignRole = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { userIds, role } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required",
      });
    }

    const results = await Promise.allSettled(
      userIds.map((userId) =>
        fetch(`${BASE_URL}/admin/users/${userId}/roles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${req.session.token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }).then((r) => r.json())
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return res.json({
      success: true,
      message: `Role assigned to ${successful} user(s). ${failed} failed.`,
      details: { successful, failed, total: userIds.length },
    });
  } catch (error) {
    console.error("Error in bulk assign role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during bulk operation",
    });
  }
};
