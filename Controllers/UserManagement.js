const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const BASE_URL = "https://oprsk.bizengineconsulting.com/api";

exports.userManagement = async (req, res) => {
  try {
    // Login check
    if (!req.session.token) {
      return res.redirect("/");
    }
    const token = req.session.token;

    // Fetch users, roles, and permissions in parallel
    const [usersResponse, rolesResponse, permissionsResponse] =
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
      ]);

    const usersData = await usersResponse.json();
    const rolesData = await rolesResponse.json();
    const permissionsData = await permissionsResponse.json();

    console.log("Users fetched:", usersData.data.data.length);
    console.log("Roles fetched:", rolesData.data.data.length);
    console.log("Permissions fetched:", permissionsData.data.data.length);

    return res.render("pages/user_management", {
      pageTitle: "User Management",
      users: usersData.data.data || [],
      roles: rolesData.data.data || [],
      permissions: permissionsData.data.data || [],
      totalUsers: usersData.data.total || 0,
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
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const response = await fetch(`${BASE_URL}/admin/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${req.session.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${req.session.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
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
    return res.json(data);
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Assign role to user
exports.assignRole = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
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
    return res.json(data);
  } catch (error) {
    console.error("Error assigning role:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get role permissions
exports.getRolePermissions = async (req, res) => {
  try {
    if (!req.session.token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
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
    return res.json(data);
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
