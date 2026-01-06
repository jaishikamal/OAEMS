// No fetch import needed - it's built-in

const BASE_URL = "https://oprsk.bizengineconsulting.com/api";

// Main page render
exports.userManagement = async (req, res) => {
  try {
    // Enable login check
    if (!req.session || !req.session.token) {
      console.log("No session or token, redirecting to login");
      return res.redirect("/");
    }
    
    const token = req.session.token;
    
    console.log("Starting fetch for user management data...");

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
      }).catch((err) => {
        console.error("Users fetch error:", err);
        return { ok: false, status: 500 };
      }),
      fetch(`${BASE_URL}/admin/roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch((err) => {
        console.error("Roles fetch error:", err);
        return { ok: false, status: 500 };
      }),
      fetch(`${BASE_URL}/admin/permissions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch((err) => {
        console.error("Permissions fetch error:", err);
        return { ok: false, status: 500 };
      }),
      fetch(`${BASE_URL}/branches`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }).catch((err) => {
        console.error("Branches fetch error:", err);
        return { ok: false, status: 500 };
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

    console.log("Fetch completed, checking responses...");

    // Check if any critical API call failed
    if (!usersResponse.ok || !rolesResponse.ok || !permissionsResponse.ok || !branchesResponse.ok) {
      console.error("One or more API calls failed");
      console.error("Users:", usersResponse.status);
      console.error("Roles:", rolesResponse.status);
      console.error("Permissions:", permissionsResponse.status);
      console.error("Branches:", branchesResponse.status);

      // CHECK FOR 401 - Token expired/invalid, redirect to login
      if (
        usersResponse.status === 401 || 
        rolesResponse.status === 401 || 
        permissionsResponse.status === 401 || 
        branchesResponse.status === 401
      ) {
        console.log("Unauthorized (401), clearing session and redirecting to login");
        // Destroy session and redirect
        return req.session.destroy((err) => {
          if (err) console.error("Session destroy error:", err);
          res.redirect("/");
        });
      }
      
      // For other errors, redirect to login (safe fallback)
      console.log("API error, redirecting to login");
      return req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
        res.redirect("/");
      });
    }

    console.log("Parsing responses...");

    const usersData = await usersResponse.json();
    const rolesData = await rolesResponse.json();
    const permissionsData = await permissionsResponse.json();
    const branchesData = await branchesResponse.json();
    const riskAreasData = riskAreasResponse.ok
      ? await riskAreasResponse.json()
      : { data: { items: [] } };

    console.log("Data parsed successfully");

    // Safely access nested data with fallbacks
    const users = (usersData?.data?.data || []).map((user) => {
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

    console.log("Rendering page with", users.length, "users");

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
    console.error("Error in userManagement:", error);
    console.error("Error stack:", error.stack);
    
    // Redirect to login on any error
    return req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      res.redirect("/");
    });
  }
};


// Create user
exports.createUser = async (req, res) => {
  try {
    if (!req.session || !req.session.token) {
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

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || "TempPass123!",
      department_id: departmentId,
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
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          message: "Session expired - Please login again",
        });
      }
      
      return res.status(response.status || 400).json({
        success: false,
        message: data.message || "Error creating user",
        error: data.error || null,
      });
    }

    // Assign role if user was created successfully and role is specified
    let roleAssigned = false;
    if (data.success && req.body.role && data.data?.id) {
      console.log(`Attempting to assign role "${req.body.role}" to user ${data.data.id}`);
      
      try {
        // Fetch roles to get the role ID
        const rolesResponse = await fetch(`${BASE_URL}/admin/roles`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          
          // Find role ID by name
          const role = (rolesData?.data?.data || rolesData?.data || []).find(
            r => r.name === req.body.role
          );

          if (!role) {
            console.warn(`Role "${req.body.role}" not found. Skipping role assignment.`);
          } else {
            const roleId = role.id;
            console.log(`Found role ID: ${roleId} for role "${req.body.role}"`);

            // Assign role using role_id
            const roleResponse = await fetch(
              `${BASE_URL}/admin/users/${data.data.id}/assign-role`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ role_id: roleId }),
              }
            );

            const roleData = await roleResponse.json();

            if (roleData.success) {
              console.log(`Role assigned successfully to user ${data.data.id}`);
              roleAssigned = true;
            } else {
              console.warn(`Role assignment failed for user ${data.data.id}:`, roleData.message || 'Unknown error');
            }
          }
        } else {
          console.warn("Failed to fetch roles for role assignment");
        }
      } catch (roleError) {
        console.error(`Error assigning role to user ${data.data.id}:`, roleError.message);
      }
    }

    // Return success response with role assignment status
    return res.json({
      success: true,
      message: roleAssigned 
        ? "User created and role assigned successfully" 
        : "User created successfully",
      data: data.data,
      roleAssigned: roleAssigned,
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
// Update user
exports.updateUser = async (req, res) => {
  try {
    if (!req.session || !req.session.token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;
    const token = req.session.token;

    if (req.body.department_id && req.body.department_id.trim() === "N/A") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid department",
      });
    }

    const userData = {
      name: req.body.name,
      email: req.body.email,
      is_active: req.body.status === "Active",
      two_factor_enabled: req.body.two_factor || false,
    };

    if (
      req.body.department_id &&
      req.body.department_id.trim() !== "" &&
      req.body.department_id !== "N/A"
    ) {
      userData.department_id = parseInt(req.body.department_id, 10);
    }

    if (req.body.notes && req.body.notes.trim() !== "") {
      userData.notes = req.body.notes.trim();
    }

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
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          message: "Session expired - Please login again",
        });
      }
      
      return res.status(response.status || 400).json({
        success: false,
        message: data.message || "Error updating user",
        error: data.error || null,
      });
    }

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
    if (!req.session || !req.session.token) {
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

    if (response.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Session expired - Please login again",
      });
    }

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
    if (!req.session || !req.session.token) {
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

    if (response.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Session expired - Please login again",
      });
    }

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
    if (!req.session || !req.session.token) {
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

    if (response.status === 401) {
      return res.status(401).json({
        success: false,
        message: "Session expired - Please login again",
      });
    }

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
    if (!req.session || !req.session.token) {
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