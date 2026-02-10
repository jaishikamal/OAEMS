# Views Integration Guide

## Overview

The UserManagement module includes a comprehensive set of EJS views for rendering the user management interface. This guide explains how to integrate the views into your OAEMS application.

## Directory Structure

```
views/usermanagement/
├── auth/
│   └── login.ejs                 - Login page
├── users/
│   ├── list.ejs                  - List all users
│   ├── create.ejs                - Create new user
│   ├── view.ejs                  - View user details
│   ├── edit.ejs                  - Edit user information
│   └── change-password.ejs       - Change password
├── roles/
│   ├── list.ejs                  - List all roles
│   ├── create.ejs                - Create new role
│   ├── view.ejs                  - View role details
│   └── edit.ejs                  - Edit role
├── permissions/
│   ├── list.ejs                  - List all permissions
│   ├── create.ejs                - Create new permission
│   └── edit.ejs                  - Edit permission
├── branches/
│   ├── list.ejs                  - List all branches
│   ├── create.ejs                - Create new branch
│   ├── view.ejs                  - View branch details
│   └── edit.ejs                  - Edit branch
├── audit/
│   └── list.ejs                  - View audit logs
├── partials/
│   ├── layout.ejs                - Main layout template
│   └── dashboard-stats.ejs       - Dashboard statistics widget
├── dashboard.ejs                 - Dashboard overview
└── profile.ejs                   - User profile page
```

## View Files Description

### Authentication Views

#### login.ejs
- **Purpose:** User authentication interface
- **Features:**
  - Email/Username input
  - Password input
  - Remember me option
  - Error message display
  - Info message display
- **Route:** GET `/usermanagement/login`
- **Auth Required:** No

### User Management Views

#### users/list.ejs
- **Purpose:** Display all users in table format
- **Features:**
  - User table with pagination
  - Search by name/email
  - Filter by status
  - Filter by role
  - CRUD action buttons
  - Status badges
- **Route:** GET `/usermanagement/users`
- **Auth Required:** Yes (ADMIN, BRANCH_MANAGER)

#### users/create.ejs
- **Purpose:** Create new user form
- **Features:**
  - User information fields
  - Password validation
  - Role assignment checkboxes
  - Branch assignment checkboxes
  - Default branch selection
- **Route:** GET `/usermanagement/users/create`
- **Auth Required:** Yes (ADMIN only)

#### users/view.ejs
- **Purpose:** Display user details and relationships
- **Features:**
  - User information display
  - Assigned roles list
  - Assigned branches list
  - Account status
  - Action buttons (edit, change password, suspend/activate, unlock)
- **Route:** GET `/usermanagement/users/:id/view`
- **Auth Required:** Yes

#### users/edit.ejs
- **Purpose:** Edit user information and relationships
- **Features:**
  - User information editing
  - Role management
  - Branch management
  - Status update
- **Route:** GET `/usermanagement/users/:id/edit`
- **Auth Required:** Yes (ADMIN only)

#### users/change-password.ejs
- **Purpose:** Change user password
- **Features:**
  - Current password input
  - New password input
  - Password requirements display
  - Confirmation input
- **Route:** GET `/usermanagement/users/:id/change-password`
- **Auth Required:** Yes

### Role Management Views

#### roles/list.ejs
- **Purpose:** Display all roles in table format
- **Features:**
  - Role table with status badges
  - System vs Custom role indicators
  - Permission count
  - User count
  - CRUD action buttons
- **Route:** GET `/usermanagement/roles`
- **Auth Required:** Yes (ADMIN only)

#### roles/create.ejs
- **Purpose:** Create new role form
- **Features:**
  - Role code input
  - Role name input
  - Description field
  - Status selection
  - Priority setting
  - Permission assignment checkboxes
- **Route:** GET `/usermanagement/roles/create`
- **Auth Required:** Yes (ADMIN only)

#### roles/view.ejs
- **Purpose:** Display role details and relationships
- **Features:**
  - Role information display
  - Assigned permissions list
  - Users with this role
  - System role indicator
- **Route:** GET `/usermanagement/roles/:id/view`
- **Auth Required:** Yes (ADMIN only)

#### roles/edit.ejs
- **Purpose:** Edit role information and permissions
- **Features:**
  - Role information editing
  - Permission management
  - Status update
  - System role protection
- **Route:** GET `/usermanagement/roles/:id/edit`
- **Auth Required:** Yes (ADMIN only)

### Permission Management Views

#### permissions/list.ejs
- **Purpose:** Display all permissions
- **Features:**
  - Tabbed interface by module
  - Permission table
  - Module, resource, action display
  - System vs Custom indicator
  - Delete button for custom permissions
- **Route:** GET `/usermanagement/permissions`
- **Auth Required:** Yes (ADMIN only)

#### permissions/create.ejs
- **Purpose:** Create new permission form
- **Features:**
  - Permission code input
  - Permission name input
  - Module selection
  - Resource input
  - Action selection
  - Status selection
  - Description field
- **Route:** GET `/usermanagement/permissions/create`
- **Auth Required:** Yes (ADMIN only)

#### permissions/edit.ejs
- **Purpose:** Edit permission information
- **Features:**
  - Permission code display (read-only)
  - Name and description editing
  - Status update
  - System permission protection
- **Route:** GET `/usermanagement/permissions/:id/edit`
- **Auth Required:** Yes (ADMIN only)

### Branch Management Views

#### branches/list.ejs
- **Purpose:** Display all branches
- **Features:**
  - Branch table
  - Level indicator (Head Office, Regional, Local)
  - Status badge
  - User count
  - Location and country display
  - CRUD action buttons
- **Route:** GET `/usermanagement/branches`
- **Auth Required:** Yes (ADMIN, BRANCH_MANAGER)

#### branches/create.ejs
- **Purpose:** Create new branch form
- **Features:**
  - Branch code and name input
  - Branch level selection
  - Parent branch selection
  - Location details (country, state, city, address)
  - Contact information (phone, email)
  - Manager field
  - Status selection
- **Route:** GET `/usermanagement/branches/create`
- **Auth Required:** Yes (ADMIN only)

#### branches/view.ejs
- **Purpose:** Display branch details and users
- **Features:**
  - Branch information display
  - Geographic details
  - Assigned users list
  - Contact information
  - Edit action button
- **Route:** GET `/usermanagement/branches/:id/view`
- **Auth Required:** Yes

#### branches/edit.ejs
- **Purpose:** Edit branch information
- **Features:**
  - Branch information editing
  - Status update
  - Location details editing
- **Route:** GET `/usermanagement/branches/:id/edit`
- **Auth Required:** Yes (ADMIN only)

### Audit Views

#### audit/list.ejs
- **Purpose:** Display audit logs
- **Features:**
  - Audit log table
  - Filter by module
  - Filter by action
  - Filter by status
  - Search functionality
  - Details modal with change tracking
  - Pagination
- **Route:** GET `/usermanagement/audit-logs`
- **Auth Required:** Yes (ADMIN, AUDITOR only)

### Other Views

#### dashboard.ejs
- **Purpose:** User management dashboard
- **Features:**
  - Statistics cards (users, roles, branches)
  - Quick links to management pages
  - Recent activity log
  - System information
  - Security status display
- **Route:** GET `/usermanagement/dashboard`
- **Auth Required:** Yes

#### profile.ejs
- **Purpose:** User profile view
- **Features:**
  - User information display
  - Role display
  - Branch display
  - Edit profile and change password links
  - Account status
- **Route:** GET `/usermanagement/profile`
- **Auth Required:** Yes

### Common Partials

#### layout.ejs
- **Purpose:** Main layout template
- **Features:**
  - Responsive sidebar navigation
  - Top navigation bar
  - User account menu
  - Alert messages
  - Footer
  - Bootstrap 5 styling
- **Usage:** Wrap all views with this layout

#### dashboard-stats.ejs
- **Purpose:** Reusable statistics widget
- **Features:**
  - Statistics cards with icons
  - Recent activity list
  - User statistics table
- **Usage:** Include in dashboard and other pages

## Integration Steps

### Step 1: Register View Routes

In your `app.js`:

```javascript
const viewRoutes = require('./UserManagement/routes/viewRoutes');

// Must be registered AFTER authentication middleware setup
app.use('/usermanagement', viewRoutes);
```

### Step 2: Configure EJS View Engine

Ensure your `app.js` has EJS view engine configured:

```javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

### Step 3: Add Bootstrap & Icons CSS

In your main layout or main.ejs:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
```

### Step 4: Ensure Middleware Stack

Verify middleware order in app.js:

```javascript
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Middleware order:
1. bodyParser (for form data)
2. cookieParser (for cookies)
3. session (for sessions)
4. userManagementRoutes (for API)
5. viewRoutes (for views)
```

## View Features

### Authentication & Authorization

- All views require `authMiddleware`
- Views check role via `roleMiddleware('ADMIN', 'BRANCH_MANAGER', etc.)`
- Unauthorized users redirected to login

### Responsive Design

- Mobile-friendly using Bootstrap 5
- Sidebar collapses on small screens
- Tables responsive with horizontal scroll on mobile
- Modal dialogs for confirmations

### User Feedback

- Alert messages for success/error
- Toast notifications (can be implemented)
- Loading indicators
- Form validation feedback

### Interactive Elements

- Search and filter functionality
- Pagination for large datasets
- Modal dialogs for details/confirmations
- Inline editing capabilities
- Status badges and icons

## Customization

### Change Sidebar Theme

Edit `views/usermanagement/partials/layout.ejs`:

```html
<style>
  .sidebar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Change these colors */
  }
</style>
```

### Change Table Styling

Edit individual view files and update table classes:

```html
<table class="table table-hover table-striped">
  <!-- Add striped class for striped rows -->
</table>
```

### Add Custom Fields

In form views, add new fields:

```html
<div class="col-md-6 mb-3">
  <label for="customField" class="form-label">Custom Field</label>
  <input type="text" class="form-control" id="customField" name="customField">
</div>
```

## Common Issues & Solutions

### Issue: Views not rendering

**Solution:** Check that viewRoutes are registered in app.js:
```javascript
app.use('/usermanagement', viewRoutes);
```

### Issue: CSS/JS not loading

**Solution:** Ensure CDN links are correct and public folder is configured:
```javascript
app.use(express.static('public'));
```

### Issue: Forms not submitting

**Solution:** Verify form action URL matches route:
```html
<!-- For POST -->
<form action="/usermanagement/users" method="POST">

<!-- For PUT/PATCH, use hidden _method field -->
<form action="/usermanagement/users/<%- id %>" method="POST">
  <input type="hidden" name="_method" value="PUT">
</form>
```

### Issue: Sidebar navigation highlighting inactive

**Solution:** Ensure page variable is set in controller:
```javascript
res.render('view', {
  page: 'users',  // This value highlights the menu
  title: 'Users'
});
```

## Testing Views in Browser

Once integrated, test URLs:

- Login: `http://localhost:3000/usermanagement/login`
- Dashboard: `http://localhost:3000/usermanagement/dashboard`
- Users: `http://localhost:3000/usermanagement/users`
- Roles: `http://localhost:3000/usermanagement/roles`
- Permissions: `http://localhost:3000/usermanagement/permissions`
- Branches: `http://localhost:3000/usermanagement/branches`
- Audit Logs: `http://localhost:3000/usermanagement/audit-logs`
- Profile: `http://localhost:3000/usermanagement/profile`

## Performance Optimization

### 1. Caching

Add cache headers for static assets:
```javascript
app.use(express.static('public', {
  maxAge: 3600000  // 1 hour cache
}));
```

### 2. Pagination

All list views use pagination to load fewer records:
```javascript
const limit = 10;  // Adjust for performance
const offset = (page - 1) * limit;
```

### 3. Query Optimization

Views include only necessary fields:
```javascript
User.findAll({
  attributes: ['id', 'firstName', 'email'],  // Only select needed fields
  limit: 10
});
```

---

**Next Steps:**
1. Register viewRoutes in your app.js
2. Test view rendering at each URL
3. Customize styling to match your brand
4. Add additional views as needed

For API-related endpoints used by forms, refer to [INTEGRATION_GUIDE.js](./INTEGRATION_GUIDE.js)
