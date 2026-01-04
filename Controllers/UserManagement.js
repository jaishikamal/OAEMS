const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const BASE_URL = "https://oprsk.bizengineconsulting.com/api";

// Main page render
exports.userManagement = async (req, res) => {
  try {
    // Login check
    if (!req.session.token) {
      return res.redirect("/");
    }
    const token = req.session.token;

    // Fetch users, roles, permissions, branches, and departments in parallel
    const [usersResponse, rolesResponse, permissionsResponse, branchesResponse, departmentsResponse] =
      await Promise.all([
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
        fetch(`${BASE_URL}/departments`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }).catch(err => {
          console.log("Departments endpoint not available, using fallback");
          return null;
        }),
      ]);

    const usersData = await usersResponse.json();
    const rolesData = await rolesResponse.json();
    const permissionsData = await permissionsResponse.json();
    const branchesData = await branchesResponse.json();
    const departmentsData = departmentsResponse ? await departmentsResponse.json() : null;

    // Process users to normalize branch and department data
    const users = (usersData.data.data || []).map(user => {
      // Normalize branch_id - handle both single branch_id and branches array
      let branchId = null;
      let branchName = null;
      
      if (user.branch_id) {
        branchId = user.branch_id;
        // Find branch name from branches list
        const branch = (branchesData.data?.data || []).find(b => b.id == branchId);
        if (branch) branchName = branch.name;
      } else if (user.branches && user.branches.length > 0) {
        branchId = user.branches[0].id;
        branchName = user.branches[0].name;
      } else if (user.branch) {
        branchId = user.branch.id;
        branchName = user.branch.name;
      }

      // Normalize department
      let departmentId = user.department_id || null;
      let departmentName = null;
      
      if (user.department && typeof user.department === 'object') {
        departmentId = user.department.id;
        departmentName = user.department.name;
      } else if (user.department && typeof user.department === 'string') {
        departmentName = user.department;
      } else if (departmentId && departmentsData?.data?.data) {
        // Find department name from departments list
        const dept = departmentsData.data.data.find(d => d.id == departmentId);
        if (dept) departmentName = dept.name;
      }
      
      return {
        ...user,
        branch_id: branchId,
        branch_name: branchName,
        department_id: departmentId,
        department_name: departmentName || user.department || ''
      };
    });

    // Calculate statistics
    const activeUsers = users.filter(u => u.is_active).length;
    const pendingUsers = users.filter(u => u.status === 'Pending').length;
    const adminUsers = users.filter(u => 
      u.roles && u.roles.some(r => r.name === 'Administrator')
    ).length;

    console.log("Users fetched:", users.length);
    console.log("Roles fetched:", rolesData.data.data.length);
    console.log("Permissions fetched:", permissionsData.data.data.length);
    console.log("Branches fetched:", branchesData.data?.data?.length || 0);
    console.log("Departments fetched:", departmentsData?.data?.data?.length || 0);

    return res.render("pages/user_management", {
      pageTitle: "User Management",
      layout: "main",
      users: users,
      roles: rolesData.data.data || [],
      permissions: permissionsData.data.data || [],
      branches: branchesData.data?.data || [],
      departments: departmentsData?.data?.data || [],
      totalUsers: usersData.data.total || users.length,
      activeUsers: activeUsers,
      pendingUsers: pendingUsers,
      adminUsers: adminUsers,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return res.status(500).render("error", {
      message: "Failed to load user management data",
      error: error,
    });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    console.log("Creating user with data:", req.body);

    // Validate required fields
    if (!req.body.branch_id) {
      return res.status(400).json({
        success: false,
        message: "Branch is required"
      });
    }

    if (!req.body.department_id) {
      return res.status(400).json({
        success: false,
        message: "Department is required"
      });
    }

    // Transform frontend data to API format
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password || 'TempPass123!',
      department_id: parseInt(req.body.department_id), // Use department_id instead of department
      branch_ids: [parseInt(req.body.branch_id)],
      is_active: req.body.status === 'Active',
      notes: req.body.notes || '',
      two_factor_enabled: req.body.two_factor || false
    };

    console.log("Sending to API:", userData);

    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${req.session.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("API Response:", data);
    
    // If user created successfully and role specified, assign role
    if (data.success && req.body.role && data.data?.id) {
      console.log("Assigning role:", req.body.role);
      await fetch(`${BASE_URL}/admin/users/${data.data.id}/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${req.session.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: req.body.role }),
      });
    }

    return res.json({
      success: data.success || response.ok,
      message: data.message || 'User created successfully',
      data: data.data
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while creating user",
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const { id } = req.params;
    
    // Transform frontend data to API format
    const userData = {
      name: req.body.name,
      email: req.body.email,
      is_active: req.body.status === 'Active',
      two_factor_enabled: req.body.two_factor || false
    };

    // Add department_id if provided
    if (req.body.department_id) {
      userData.department_id = parseInt(req.body.department_id);
    }

    // Only add notes if provided
    if (req.body.notes && req.body.notes.trim() !== '') {
      userData.notes = req.body.notes.trim();
    }

    // Add branch_ids if provided
    if (req.body.branch_id) {
      userData.branch_ids = [parseInt(req.body.branch_id)];
    }

    console.log("Updating user", id, "with data:", userData);

    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${req.session.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Update response:", data);
    
    // If role specified, update role
    if (data.success && req.body.role) {
      console.log("Updating role to:", req.body.role);
      await fetch(`${BASE_URL}/admin/users/${id}/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${req.session.token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: req.body.role }),
      });
    }

    return res.json({
      success: data.success || response.ok,
      message: data.message || 'User updated successfully',
      data: data.data
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while updating user",
      error: error.message 
    });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
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
      message: data.message || 'User deleted successfully'
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while deleting user" 
    });
  }
};

// Assign role to user
exports.assignRole = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
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
      message: data.message || 'Role assigned successfully',
      data: data.data
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while assigning role" 
    });
  }
};

// Get role permissions
exports.getRolePermissions = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
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
      permissions: data.data?.permissions || []
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error while fetching permissions" 
    });
  }
};

// Bulk assign role to multiple users
exports.bulkAssignRole = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const { userIds, role } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "User IDs array is required" 
      });
    }

    const results = await Promise.allSettled(
      userIds.map(userId =>
        fetch(`${BASE_URL}/admin/users/${userId}/roles`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${req.session.token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }).then(r => r.json())
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return res.json({
      success: true,
      message: `Role assigned to ${successful} user(s). ${failed} failed.`,
      details: { successful, failed, total: userIds.length }
    });
  } catch (error) {
    console.error("Error in bulk assign role:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during bulk operation" 
    });
  }
};