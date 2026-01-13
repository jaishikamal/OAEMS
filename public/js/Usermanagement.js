
  
  // User Management JavaScript - COMPLETE FIXED VERSION
  (function () {
    "use strict";

    // Wait for DOM to be ready
    document.addEventListener("DOMContentLoaded", function () {
      console.log("User Management initialized");

      // Initialize Bootstrap components
      const userModalEl = document.getElementById("userModal");
      const feedbackToastEl = document.getElementById("feedbackToast");

      if (!userModalEl || !feedbackToastEl) {
        console.error("Required modal or toast elements not found");
        return;
      }

      const userModal = new bootstrap.Modal(userModalEl);
      const feedbackToast = new bootstrap.Toast(feedbackToastEl);

      // State management
      let selectedUsers = new Set();
      let currentEditingUserId = null;
      let isSubmitting = false;

      // ============================================
      // HELPER FUNCTIONS
      // ============================================
      function showToast(message, type = "success") {
        const toastEl = document.getElementById("feedbackToast");
        const toastBody = toastEl.querySelector(".toast-body");
        toastBody.textContent = message;
        toastEl.className = `toast align-items-center border-0 ${
          type === "error" ? "text-bg-danger" : "text-bg-primary"
        }`;
        feedbackToast.show();
      }

      function updateSelectedCount() {
        const count = selectedUsers.size;
        const selectedCountEl = document.getElementById("selectedCount");
        const assignRoleBtn = document.getElementById("assignRoleBtn");

        if (selectedCountEl) {
          selectedCountEl.textContent = `${count} selected`;
        }
        if (assignRoleBtn) {
          assignRoleBtn.disabled = count === 0;
        }
      }

      // Update row numbers after adding/removing users
      function updateRowNumbers() {
        const rows = document.querySelectorAll("#usersTable tbody tr");
        rows.forEach((row, index) => {
          if (row.cells.length > 1) {
            const indexCell = row.cells[1];
            if (indexCell) {
              const fwMedium = indexCell.querySelector(".fw-medium");
              if (fwMedium) {
                fwMedium.textContent = index + 1;
              }
            }
          }
        });
      }

      // Add user to table dynamically
      function addUserToTable(user, isLatest = false) {
        const tbody = document.querySelector("#usersTable tbody");
        if (!tbody) return;

        console.log("Adding user to table:", JSON.stringify(user, null, 2));

        // Remove "No users found" row if exists
        const noUsersRow = tbody.querySelector('td[colspan="9"]');
        if (noUsersRow) {
          noUsersRow.parentElement.remove();
        }

        // Get current row count for index
        const currentRows = tbody.querySelectorAll("tr").length;
        const rowIndex = currentRows + 1;

        // Create new row
        const row = document.createElement("tr");
        row.setAttribute("data-user-id", user.id);
        row.setAttribute("data-branch-id", user.branch_id || "");
        row.setAttribute("data-department-id", user.department_id || "");
        row.setAttribute("data-department-name", user.department_name || "");

        // Highlight if it's the latest user
        if (isLatest) {
          row.classList.add("table-success");
          setTimeout(() => {
            row.classList.remove("table-success");
          }, 3000);
        }

        // Get user initials for avatar
        const initials = user.name
          ? user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
          : "U";

        // Determine role badge
        let roleBadge = '<span class="badge bg-label-secondary">No role</span>';

        if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
          const roleName = user.roles[0].name;
          roleBadge = `<span class="badge bg-label-primary">${roleName}</span>`;
        } else if (
          user.role &&
          user.role.trim() !== "" &&
          user.role !== "No role"
        ) {
          roleBadge = `<span class="badge bg-label-primary">${user.role}</span>`;
        }

        // Determine status badge
        const statusBadge = user.is_active
          ? '<span class="badge bg-label-success">Active</span>'
          : '<span class="badge bg-label-danger">Inactive</span>';

        // Build row HTML
        row.innerHTML = `
          <td>
            <input type="checkbox" class="form-check-input user-checkbox" value="${
              user.id
            }" />
          </td>
          <td><span class="fw-medium">${rowIndex}</span></td>
          <td>
            <div class="d-flex align-items-center">
              <div class="avatar avatar-sm me-2">
                <span class="avatar-initial rounded-circle bg-label-primary">
                  ${initials}
                </span>
              </div>
              <div>
                <span class="fw-medium" data-field="name">${user.name}</span>
              </div>
            </div>
          </td>
          <td data-field="email">${user.email}</td>
          <td data-field="role">${roleBadge}</td>
          <td data-field="department">${
            user.department_name || '<span class="text-muted">Not set</span>'
          }</td>
          <td data-field="branch">${
            user.branch_name || '<span class="text-muted">Not assigned</span>'
          }</td>
          <td data-field="status">${statusBadge}</td>
          <td class="text-end">
            <div class="dropdown">
              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                <i class="icon-base ti tabler-dots-vertical"></i>
              </button>
              <div class="dropdown-menu">
                <a class="dropdown-item edit-user-btn" href="#" data-user-id="${
                  user.id
                }">
                  <i class="icon-base ti tabler-edit me-1"></i>Edit
                </a>
                <a class="dropdown-item delete-user-btn text-danger" href="#" data-user-id="${
                  user.id
                }">
                  <i class="icon-base ti tabler-trash me-1"></i>Delete
                </a>
              </div>
            </div>
          </td>
        `;

        // Insert at the top of the table (latest user first)
        if (isLatest && tbody.firstChild) {
          tbody.insertBefore(row, tbody.firstChild);
        } else {
          tbody.appendChild(row);
        }

        // Update row numbers
        updateRowNumbers();
      }

      // Update stats after adding user
      function updateStats(isActive) {
        const totalUsersEl = document.querySelector(
          ".col-sm-6.col-xl-3:first-child .card-body h4"
        );
        if (totalUsersEl) {
          const currentTotal = parseInt(totalUsersEl.textContent) || 0;
          totalUsersEl.textContent = currentTotal + 1;
        }

        if (isActive) {
          const activeUsersEl = document.querySelector(
            ".col-sm-6.col-xl-3:nth-child(2) .card-body h4"
          );
          if (activeUsersEl) {
            const currentActive = parseInt(activeUsersEl.textContent) || 0;
            activeUsersEl.textContent = currentActive + 1;
          }
        }
      }

      // ============================================
      // SEARCH & FILTER
      // ============================================
      function filterTable() {
        const searchTerm =
          document.getElementById("searchUserInput")?.value.toLowerCase() || "";
        const roleValue = document.getElementById("roleFilter")?.value || "";
        const statusValue =
          document.getElementById("statusFilter")?.value || "";
        const departmentValue =
          document.getElementById("departmentFilter")?.value || "";

        const rows = document.querySelectorAll("#usersTable tbody tr");

        rows.forEach((row) => {
          if (row.cells.length <= 1) return;

          const name = row.cells[2].textContent.toLowerCase();
          const email = row.cells[3].textContent.toLowerCase();
          const role = row.cells[4].textContent.trim();
          const department = row.cells[5].textContent.trim();
          const status = row.cells[7].textContent.trim();

          const matchesSearch =
            name.includes(searchTerm) || email.includes(searchTerm);
          const matchesRole = !roleValue || role.includes(roleValue);
          const matchesStatus = !statusValue || status === statusValue;
          const matchesDepartment =
            !departmentValue || department.includes(departmentValue);

          row.style.display =
            matchesSearch && matchesRole && matchesStatus && matchesDepartment
              ? ""
              : "none";
        });
      }

      // Attach filter listeners
      const searchInput = document.getElementById("searchUserInput");
      const roleFilter = document.getElementById("roleFilter");
      const statusFilter = document.getElementById("statusFilter");
      const departmentFilter = document.getElementById("departmentFilter");
      const resetFiltersBtn = document.getElementById("resetFiltersBtn");

      searchInput?.addEventListener("input", filterTable);
      roleFilter?.addEventListener("change", filterTable);
      statusFilter?.addEventListener("change", filterTable);
      departmentFilter?.addEventListener("change", filterTable);

      resetFiltersBtn?.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (roleFilter) roleFilter.value = "";
        if (statusFilter) statusFilter.value = "";
        if (departmentFilter) departmentFilter.value = "";
        filterTable();
      });

      // ============================================
      // CHECKBOX SELECTION
      // ============================================
      const selectAllCheckbox = document.getElementById("selectAll");

      selectAllCheckbox?.addEventListener("change", function () {
        const checkboxes = document.querySelectorAll(".user-checkbox");
        checkboxes.forEach((cb) => {
          cb.checked = this.checked;
          if (this.checked) {
            selectedUsers.add(cb.value);
          } else {
            selectedUsers.delete(cb.value);
          }
        });
        updateSelectedCount();
      });

      document.addEventListener("change", function (e) {
        if (e.target.classList.contains("user-checkbox")) {
          if (e.target.checked) {
            selectedUsers.add(e.target.value);
          } else {
            selectedUsers.delete(e.target.value);
          }
          updateSelectedCount();

          const allCheckboxes = document.querySelectorAll(".user-checkbox");
          const allChecked = Array.from(allCheckboxes).every(
            (cb) => cb.checked
          );
          if (selectAllCheckbox) {
            selectAllCheckbox.checked = allChecked;
          }
        }
      });

      // ============================================
      // ADD USER
      // ============================================
      const addUserBtn = document.getElementById("addUserBtn");
      const userForm = document.getElementById("userForm");

      addUserBtn?.addEventListener("click", function () {
        currentEditingUserId = null;
        isSubmitting = false;
        userForm.reset();

        // NEW: Show password as REQUIRED for new users
        const passwordField = document.getElementById("userPassword");
        const passwordRequired = document.getElementById("passwordRequired");
        const passwordHelp = document.getElementById("passwordHelp");

        if (passwordField) {
          passwordField.required = true;
          passwordField.placeholder = "Enter password";
        }
        if (passwordRequired) passwordRequired.style.display = "inline";
        if (passwordHelp) passwordHelp.textContent = "Minimum 8 characters";

        const submitBtn = document.getElementById("submitUserBtn");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Save";
        }

        document.querySelector("#userModal .modal-title").innerHTML =
          '<i class="icon-base ti tabler-user-plus me-2"></i>Add New User';
        userModal.show();
      });

      // ============================================
      // EDIT USER
      // ============================================
      document.addEventListener("click", function (e) {
        const editBtn = e.target.closest(".edit-user-btn");
        if (editBtn) {
          e.preventDefault();
          const userId = editBtn.dataset.userId;
          const row = document.querySelector(`tr[data-user-id="${userId}"]`);

          if (row) {
            currentEditingUserId = userId;
            isSubmitting = false;

            const name =
              row.querySelector('[data-field="name"]')?.textContent.trim() ||
              "";
            const email =
              row.querySelector('[data-field="email"]')?.textContent.trim() ||
              "";
            const roleBadge =
              row
                .querySelector('[data-field="role"] .badge')
                ?.textContent.trim() || "";
            const departmentId = row.dataset.departmentId || "";
            const statusBadge =
              row
                .querySelector('[data-field="status"] .badge')
                ?.textContent.trim() || "";
            const branchId = row.dataset.branchId || "";

            document.getElementById("userFullName").value = name;
            document.getElementById("userEmail").value = email;

            // CHANGED: Match role by name to get ID
            const roleSelect = document.getElementById("userRole");
            if (roleSelect && roleBadge !== "No role") {
              for (let option of roleSelect.options) {
                if (option.text.toLowerCase() === roleBadge.toLowerCase()) {
                  roleSelect.value = option.value; // Set the ID
                  break;
                }
              }
            } else if (roleSelect) {
              roleSelect.value = "";
            }

            document.getElementById("userStatus").value = statusBadge;
            document.getElementById("userBranch").value = branchId;
            document.getElementById("userDepartment").value = departmentId;

            // NEW: Make password OPTIONAL for editing
            const passwordField = document.getElementById("userPassword");
            const passwordRequired =
              document.getElementById("passwordRequired");
            const passwordHelp = document.getElementById("passwordHelp");

            if (passwordField) {
              passwordField.required = false;
              passwordField.value = "";
              passwordField.placeholder = "Leave blank to keep current";
            }
            if (passwordRequired) passwordRequired.style.display = "none";
            if (passwordHelp)
              passwordHelp.textContent = "Leave blank to keep current password";

            const submitBtn = document.getElementById("submitUserBtn");
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Save";
            }

            document.querySelector("#userModal .modal-title").innerHTML =
              '<i class="icon-base ti tabler-user-edit me-2"></i>Edit User';
            userModal.show();
          }
        }
      });

      // ============================================
      // DELETE USER
      // ============================================
      document.addEventListener("click", function (e) {
        const deleteBtn = e.target.closest(".delete-user-btn");
        if (deleteBtn) {
          e.preventDefault();
          const userId = deleteBtn.dataset.userId;
          const row = document.querySelector(`tr[data-user-id="${userId}"]`);
          const userName =
            row?.querySelector('[data-field="name"]')?.textContent.trim() ||
            "this user";

          if (confirm(`Are you sure you want to delete ${userName}?`)) {
            fetch(`/api/users/${userId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data.success) {
                  showToast("User deleted successfully!");
                  row?.remove();
                  updateRowNumbers();
                } else {
                  showToast(data.message || "Error deleting user", "error");
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                showToast("Error connecting to server", "error");
              });
          }
        }
      });

      // ============================================
      // SUBMIT USER FORM - COMPLETE FIXED VERSION
      // ============================================
      userForm?.addEventListener("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (isSubmitting) {
          console.log("Form already submitting, ignoring duplicate submit");
          return;
        }

        const branchId = document.getElementById("userBranch").value;
        const departmentId = document.getElementById("userDepartment").value;
        const password = document.getElementById("userPassword").value; // NEW

        if (!branchId) {
          showToast("Please select a branch", "error");
          return;
        }

        if (!departmentId) {
          showToast("Please select a department", "error");
          return;
        }

        // NEW: Password required for new users
        if (!currentEditingUserId && !password) {
          showToast("Password is required for new users", "error");
          return;
        }

        // Get branch, department, and role names for display
        const branchSelect = document.getElementById("userBranch");
        const departmentSelect = document.getElementById("userDepartment");
        const roleSelect = document.getElementById("userRole");

        const branchName =
          branchSelect.options[branchSelect.selectedIndex]?.text || "";
        const departmentName =
          departmentSelect.options[departmentSelect.selectedIndex]?.text || "";

        // CHANGED: Get role ID instead of name
        const roleId = roleSelect.value;
        const selectedRoleName =
          roleSelect.options[roleSelect.selectedIndex]?.text || "";

        const formData = {
          name: document.getElementById("userFullName").value.trim(),
          email: document.getElementById("userEmail").value.trim(),
          role_id: roleId || null, // CHANGED: Send role_id (number)
          branch_id: branchId,
          department_id: departmentId,
          status: document.getElementById("userStatus").value,
          notes: document.getElementById("userNotes")?.value.trim() || "",
          two_factor:
            document.getElementById("twoFactorToggle")?.checked || false,
        };

        // NEW: Add password only if provided
        if (password) {
          formData.password = password;
        }

        console.log("Submitting form data:", formData);

        const url = currentEditingUserId
          ? `/api/users/${currentEditingUserId}`
          : "/api/users";
        const method = currentEditingUserId ? "PUT" : "POST";

        isSubmitting = true;
        const submitBtn = document.getElementById("submitUserBtn");
        const originalBtnText = submitBtn ? submitBtn.textContent : "Save";

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
        }

        fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Server response:", data);

            if (data.success) {
              if (currentEditingUserId) {
                // UPDATE: Refresh the specific row in the table
                console.log("Updating existing user row...");

                const row = document.querySelector(
                  `tr[data-user-id="${currentEditingUserId}"]`
                );
                if (row) {
                  // Update row attributes
                  row.setAttribute("data-branch-id", branchId);
                  row.setAttribute("data-department-id", departmentId);
                  row.setAttribute("data-department-name", departmentName);

                  // Update name
                  const nameCell = row.querySelector('[data-field="name"]');
                  if (nameCell) nameCell.textContent = formData.name;

                  // Update email
                  const emailCell = row.querySelector('[data-field="email"]');
                  if (emailCell) emailCell.textContent = formData.email;

                  // Update role
                  const roleCell = row.querySelector('[data-field="role"]');
                  if (roleCell) {
                    let roleBadge =
                      '<span class="badge bg-label-secondary">No role</span>';

                    if (
                      data.data?.roles &&
                      Array.isArray(data.data.roles) &&
                      data.data.roles.length > 0
                    ) {
                      const roleName = data.data.roles[0].name;
                      roleBadge = `<span class="badge bg-label-primary">${roleName}</span>`;
                    } else if (roleId && selectedRoleName) {
                      roleBadge = `<span class="badge bg-label-primary">${selectedRoleName}</span>`;
                    }

                    roleCell.innerHTML = roleBadge;
                  }

                  // Update department
                  const deptCell = row.querySelector(
                    '[data-field="department"]'
                  );
                  if (deptCell) {
                    deptCell.innerHTML =
                      departmentName ||
                      '<span class="text-muted">Not set</span>';
                  }

                  // Update branch
                  const branchCell = row.querySelector('[data-field="branch"]');
                  if (branchCell) {
                    branchCell.innerHTML =
                      branchName ||
                      '<span class="text-muted">Not assigned</span>';
                  }

                  // Update status
                  const statusCell = row.querySelector('[data-field="status"]');
                  if (statusCell) {
                    const statusBadge =
                      formData.status === "Active"
                        ? '<span class="badge bg-label-success">Active</span>'
                        : '<span class="badge bg-label-danger">Inactive</span>';
                    statusCell.innerHTML = statusBadge;
                  }

                  // Highlight the updated row briefly
                  row.classList.add("table-info");
                  setTimeout(() => {
                    row.classList.remove("table-info");
                  }, 2000);
                }

                showToast("User updated successfully!");
                userModal.hide();
                userForm.reset();
              } else {
                // CREATE: Add new user to table
                console.log("Processing new user data...");

                let userRoles = [];
                let displayRole = selectedRoleName;

                if (data.data.roles && data.data.roles.length > 0) {
                  userRoles = data.data.roles;
                  displayRole = data.data.roles[0].name;
                } else if (roleId && selectedRoleName) {
                  userRoles = [{ id: roleId, name: selectedRoleName }];
                }

                const newUser = {
                  id: data.data.id,
                  name: formData.name,
                  email: formData.email,
                  role: displayRole,
                  roles: userRoles,
                  branch_id: branchId,
                  branch_name: branchName,
                  department_id: departmentId,
                  department_name: departmentName,
                  is_active: formData.status === "Active",
                };

                addUserToTable(newUser, true);
                updateStats(newUser.is_active);
                showToast("User created successfully!");
                userModal.hide();
                userForm.reset();
              }

              isSubmitting = false;
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
              }
            } else {
              showToast(data.message || "Error saving user", "error");
              isSubmitting = false;
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
              }
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            showToast("Error connecting to server", "error");
            isSubmitting = false;
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalBtnText;
            }
          });
      });
      
    });
  })();
