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
      fetch(`${BASE_URL}/admin/users?per_page=1000`, {
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
    if (
      !usersResponse.ok ||
      !rolesResponse.ok ||
      !permissionsResponse.ok ||
      !branchesResponse.ok
    ) {
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
        console.log(
          "Unauthorized (401), clearing session and redirecting to login"
        );
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
    // users  list their users
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
      } else if (
        user.department &&
        typeof user.department === "string" &&
        user.department.trim() !== ""
      ) {
        departmentName = user.department.trim();
      } else if (departmentId && riskAreasData?.data?.items?.length > 0) {
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
    const adminCount = users.filter((user) =>
      (user.roles || []).some(
        (role) => (role?.name || "").toLowerCase() === "admin"
      )
    ).length;

    console.log("Total users with Admin role:", adminCount);

    return res.render("pages/User_Management", {
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
      adminUsers: adminCount,
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

// Fixed createUser function
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

    if (!req.body.department_id || req.body.department_id === "") {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Password is required for new users",
      });
    }

    const token = req.session.token;
    const departmentId = parseInt(req.body.department_id, 10);
    const branchId = parseInt(req.body.branch_id, 10);

    // Prepare user data matching API expectations
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      department_id: departmentId,
      branch_ids: [branchId], // API expects array
      is_active: req.body.status === "Active",
    };

    // Add role_ids array if role is provided
    if (req.body.role_id) {
      const roleId = parseInt(req.body.role_id, 10);
      userData.role_ids = [roleId]; // API expects role_ids array
    }

    // Add optional fields
    if (req.body.notes) {
      userData.notes = req.body.notes.trim();
    }
    if (req.body.two_factor !== undefined) {
      userData.two_factor_enabled = req.body.two_factor;
    }

    console.log("Sending to API:", userData);

    // Create the user with role_ids
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
    console.log("User creation response:", data);

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

    // Fetch complete user data with roles
    let completeUserData = data.data;
    
    if (data.data?.id) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userResponse = await fetch(
          `${BASE_URL}/admin/users/${data.data.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            completeUserData = userData.data;
            console.log("Fetched user data with roles:", completeUserData.roles);
          }
        }
      } catch (fetchError) {
        console.error("Error fetching user data:", fetchError.message);
      }
    }

    console.log("Final response data:", JSON.stringify(completeUserData, null, 2));

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data: completeUserData,
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

// Fixed updateUser function
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

    // Build update payload
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

    // Add role_ids if provided
    if (req.body.role_id) {
      const roleId = parseInt(req.body.role_id, 10);
      userData.role_ids = [roleId];
    }

    console.log(`Updating user ${id} with data:`, userData);

    // Update user with role_ids
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

    // Fetch complete user data with roles (with retry)
    let completeUserData = data.data;
    let retries = 3;

    while (retries > 0) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const userResponse = await fetch(`${BASE_URL}/admin/users/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            completeUserData = userData.data;
            console.log(
              "Fetched updated user data, roles:",
              completeUserData.roles
            );

            if (completeUserData.roles && completeUserData.roles.length > 0) {
              console.log("✓ Roles found in updated user data");
              break;
            }
          }
        }

        retries--;
        if (retries > 0) {
          console.log(`Retrying fetch... (${retries} attempts left)`);
        }
      } catch (fetchError) {
        console.error("Error fetching updated user data:", fetchError.message);
        retries--;
      }
    }

    console.log(
      "Final update response:",
      JSON.stringify(completeUserData, null, 2)
    );

    return res.json({
      success: true,
      message: "User updated successfully",
      data: completeUserData,
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
