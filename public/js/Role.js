$(document).ready(function() {
  
  // Handle Add Role Button Click - Show Modal
  $('#addRoleBtn').on('click', function (e) {
    e.preventDefault();
    
    // Reset modal to "Add" mode
    $('.role-title').text('Add New Role');
    $('#addRoleForm').removeAttr('data-role-id');
    $('#addRoleForm').removeAttr('data-mode');
    $('#addRoleForm')[0].reset();
    $('.permission-checkbox').prop('checked', false);
    $('#selectAll').prop('checked', false);
    
    $('#addRoleModal').modal('show');
  });

  // Handle Select All Permissions
  $('#selectAll').on('change', function() {
    const isChecked = $(this).is(':checked');
    $('.permission-checkbox').prop('checked', isChecked);
  });

  // Update Select All if all checkboxes are manually checked/unchecked
  $('.permission-checkbox').on('change', function() {
    const totalCheckboxes = $('.permission-checkbox').length;
    const checkedCheckboxes = $('.permission-checkbox:checked').length;
    $('#selectAll').prop('checked', totalCheckboxes === checkedCheckboxes);
  });

  // Handle Edit Role Button Click
  $(document).on('click', '.btn-edit', function(e) {
    e.preventDefault();
    const roleId = $(this).data('role-id');
    
    console.log('Editing role ID:', roleId);
    
    // Show loading
    Swal.fire({
      title: 'Loading...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Fetch role data
    $.ajax({
      url: `/admin/roles/${roleId}`,
      method: 'GET',
      success: function(response) {
        console.log('Role data loaded:', response);
        Swal.close();
        
        // Populate modal with role data
        $('#modalRoleName').val(response.data.name || '');
        $('#modalRoleDescription').val(response.data.description || '');
        
        // Clear all checkboxes first
        $('.permission-checkbox').prop('checked', false);
        $('#selectAll').prop('checked', false);
        
        // Check the permissions this role has
        if (response.data.permissions && Array.isArray(response.data.permissions)) {
          response.data.permissions.forEach(function(permission) {
            $(`.permission-checkbox[value="${permission}"]`).prop('checked', true);
          });
          
          // Update "Select All" checkbox if all are checked
          const totalCheckboxes = $('.permission-checkbox').length;
          const checkedCheckboxes = $('.permission-checkbox:checked').length;
          $('#selectAll').prop('checked', totalCheckboxes === checkedCheckboxes);
        }
        
        // Change modal title and set form to edit mode
        $('.role-title').text('Edit Role');
        $('#addRoleForm').attr('data-role-id', roleId);
        $('#addRoleForm').attr('data-mode', 'edit');
        
        // Show modal
        $('#addRoleModal').modal('show');
      },
      error: function(xhr) {
        console.error('Error loading role:', xhr);
        let errorMessage = 'Failed to load role data.';
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        });
      }
    });
  });

  // Handle Delete Role Button Click
  $(document).on('click', '.btn-delete', function(e) {
    e.preventDefault();
    const roleId = $(this).data('role-id');
    
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-primary me-3',
        cancelButton: 'btn btn-label-secondary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Send delete request
        $.ajax({
          url: `/admin/roles/delete/${roleId}`,
          method: 'POST',
          contentType: 'application/json',
          success: function(response) {
            console.log('Role deleted:', response);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Role has been deleted.',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            }).then(() => {
              // Reload the page
              location.reload();
            });
          },
          error: function(xhr, status, error) {
            console.error('Error deleting role:', xhr);
            let errorMessage = 'Failed to delete role. Please try again.';
            
            if (xhr.responseJSON && xhr.responseJSON.message) {
              errorMessage = xhr.responseJSON.message;
            }
            
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            });
          }
        });
      }
    });
  });

  // Reset modal when it's closed
  $('#addRoleModal').on('hidden.bs.modal', function () {
    $('#addRoleForm')[0].reset();
    $('.permission-checkbox').prop('checked', false);
    $('#selectAll').prop('checked', false);
    $('.role-title').text('Add New Role');
    $('#addRoleForm').removeAttr('data-role-id');
    $('#addRoleForm').removeAttr('data-mode');
  });

  // Unified Form Submission Handler (Create & Edit)
  $('#addRoleForm').on('submit', function(e) {
    e.preventDefault();

    const mode = $(this).attr('data-mode');
    const roleId = $(this).attr('data-role-id');
    
    console.log('Form submission - Mode:', mode, 'Role ID:', roleId);
    
    // Get form values
    const roleName = $('#modalRoleName').val().trim();
    const roleDescription = $('#modalRoleDescription').val().trim();
    
    // Collect selected permissions
    const permissions = [];
    $('.permission-checkbox:checked').each(function() {
      permissions.push($(this).val());
    });

    console.log('Form data - Name:', roleName, 'Permissions:', permissions);

    // Validation
    if (!roleName) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a role name',
        customClass: {
          confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
      });
      return false;
    }

    if (permissions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Permissions Selected',
        text: 'Please select at least one permission for this role',
        customClass: {
          confirmButton: 'btn btn-primary'
        },
        buttonsStyling: false
      });
      return false;
    }

    // Prepare data to send
    const roleData = {
      name: roleName,
      description: roleDescription,
      permissions: permissions
    };

    // Determine URL and messages based on mode
    let url = '/admin/roles/create';
    let loadingText = 'Creating Role...';
    let successText = 'Role created successfully';
    
    if (mode === 'edit' && roleId) {
      url = `/admin/roles/update/${roleId}`;
      loadingText = 'Updating Role...';
      successText = 'Role updated successfully';
    }

    console.log('Sending request to:', url, 'Data:', roleData);

    // Show loading
    Swal.fire({
      title: loadingText,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Send AJAX request
    $.ajax({
      url: url,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(roleData),
      success: function(response) {
        console.log('Success response:', response);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: successText,
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        }).then(() => {
          // Close modal
          $('#addRoleModal').modal('hide');
          
          // Reset form
          $('#addRoleForm')[0].reset();
          $('.permission-checkbox').prop('checked', false);
          $('#selectAll').prop('checked', false);
          
          // Reload the page
          location.reload();
        });
      },
      error: function(xhr, status, error) {
        console.error('Error response:', xhr, status, error);
        let errorMessage = 'Failed to save role. Please try again.';
        
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        } else if (xhr.responseText) {
          try {
            const errorData = JSON.parse(xhr.responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Could not parse error response');
          }
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          customClass: {
            confirmButton: 'btn btn-primary'
          },
          buttonsStyling: false
        });
      }
    });

    return false;
  });

});