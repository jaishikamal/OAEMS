# 🧪 Views Implementation Verification & Usage Guide

## Quick Verification Checklist

After integration, verify views are working:

### 1. Check Files Exist
```bash
# From OAEMS root directory
ls -la views/usermanagement/                    # Should show subdirectories
ls -la views/usermanagement/auth/               # Should have login.ejs
ls -la views/usermanagement/users/              # Should have 5 files
ls -la UserManagement/controllers/ViewController.js  # Should exist
ls -la UserManagement/routes/viewRoutes.js      # Should exist
```

### 2. Verify app.js Integration
```javascript
// app.js should contain:
const viewRoutes = require('./UserManagement/routes/viewRoutes');
app.use('/usermanagement', viewRoutes);
```

### 3. Test URLs
After starting server (`npm start`):

| URL | Expected | Notes |
|-----|----------|-------|
| http://localhost:3000/usermanagement/login | Login page | No auth needed |
| http://localhost:3000/usermanagement/dashboard | Dashboard | Requires auth |
| http://localhost:3000/usermanagement/users | Users list | Requires admin |

---

## 📋 Complete URL Reference

### Public Routes
```
GET /usermanagement/login
    └─ Shows login form
    └─ No authentication required
    └─ Renders: auth/login.ejs
```

### Authenticated Routes (Any User)
```
GET /usermanagement/dashboard
    └─ Main dashboard with statistics
    └─ Requires: Valid JWT token
    └─ Renders: dashboard.ejs

GET /usermanagement/profile
    └─ User profile page
    └─ Requires: Valid JWT token
    └─ Renders: profile.ejs

GET /usermanagement/branches/:id/view
    └─ View specific branch
    └─ Requires: Valid JWT token
    └─ Renders: branches/view.ejs

GET /usermanagement/users/:id/view
    └─ View specific user (same user or admin)
    └─ Requires: Valid JWT token
    └─ Renders: users/view.ejs
```

### Admin Routes
```
GET /usermanagement/users
    └─ List all users
    └─ Requires: Admin role
    
GET /usermanagement/users/create
    └─ Create user form
    └─ Requires: Admin role
    
GET /usermanagement/users/:id/edit
    └─ Edit user form
    └─ Requires: Admin role
    
GET /usermanagement/users/:id/change-password
    └─ Change password form
    └─ Requires: Admin role

GET /usermanagement/roles
    └─ List all roles
    └─ Requires: Admin role
    
GET /usermanagement/roles/create
    └─ Create role form
    └─ Requires: Admin role
    
GET /usermanagement/roles/:id/view
    └─ View role details
    └─ Requires: Admin role
    
GET /usermanagement/roles/:id/edit
    └─ Edit role form
    └─ Requires: Admin role

GET /usermanagement/permissions
    └─ List all permissions
    └─ Requires: Admin role
    
GET /usermanagement/permissions/create
    └─ Create permission form
    └─ Requires: Admin role
    
GET /usermanagement/permissions/:id/edit
    └─ Edit permission form
    └─ Requires: Admin role

GET /usermanagement/branches
    └─ List all branches
    └─ Requires: Admin role
    
GET /usermanagement/branches/create
    └─ Create branch form
    └─ Requires: Admin role
    
GET /usermanagement/branches/:id/edit
    └─ Edit branch form
    └─ Requires: Admin role
```

### Auditor Routes
```
GET /usermanagement/audit-logs
    └─ View audit log entries
    └─ Requires: Admin or Auditor role
    └─ Renders: audit/list.ejs
```

---

## 🔐 Authentication Flow

### Step 1: Login
```
User → GET /usermanagement/login
    ↓
Renders: auth/login.ejs (login form)
    ↓
User enters email and password
    ↓
Form submits to: POST /api/usermanagement/auth/login
```

### Step 2: Backend Authentication
```
POST /api/usermanagement/auth/login
    ↓
Verify credentials
    ↓
Generate JWT token
    ↓
Set refresh token in cookie
    ↓
Redirect to: /usermanagement/dashboard
```

### Step 3: Access Protected Views
```
GET /usermanagement/dashboard
    ↓
authMiddleware checks JWT token (from localStorage)
    ↓
Token valid? Yes → Load dashboard
    ↓
Token expired? Refresh using cookie → Retry
```

---

## 📝 Form Submission Flow

### Example: Create User

#### 1. Show Form
```
GET /usermanagement/users/create
    ↓
Query: Get all active roles and branches
    ↓
Render: users/create.ejs with form
```

#### 2. User Fills Form
```
Form fields:
  - Full Name (required)
  - Email (required, unique)
  - Username (required)
  - Password (required)
  - Department (select)
  - Roles (multi-select)
  - Branches (multi-select)
  - Status (radio)
```

#### 3. Submit Form
```
Form method: POST
Form action: /api/usermanagement/users  (API endpoint, NOT view route)
Form data:
  {
    fullName: "John Doe",
    email: "john@example.com",
    username: "johndoe",
    password: "secure123",
    department: "Finance",
    roles: [1, 2],
    branches: [1],
    status: "active"
  }
```

#### 4. API Processing
```
POST /api/usermanagement/users (in Controllers/UserManagement.js)
    ↓
Validate data
    ↓
Hash password
    ↓
Create user record
    ↓
Assign roles and branches
    ↓
Log audit entry
    ↓
Return: { success: true, redirect: '/usermanagement/users' }
```

#### 5. JavaScript Redirect
```
Client receives success
    ↓
JavaScript redirects:
  GET /usermanagement/users
    ↓
Show success message
    ↓
Display updated users list
```

---

## 🎯 Testing Each Module

### Test 1: User Management

#### List Users
```bash
GET /usermanagement/users
Status: 200
Expected: Table with user list, search, pagination
```

#### Create User
```bash
GET /usermanagement/users/create
Status: 200
Expected: Form with all fields

# Then submit:
POST /api/usermanagement/users (JSON body)
Status: 201 Created
Expected: { success: true, data: {...} }
```

#### View User
```bash
GET /usermanagement/users/1/view
Status: 200
Expected: User details with roles and branches
```

#### Edit User
```bash
GET /usermanagement/users/1/edit
Status: 200
Expected: Form pre-filled with user data

# Then submit:
PUT /api/usermanagement/users/1 (JSON body)
Status: 200 OK
Expected: { success: true, data: {...} }
```

#### Change Password
```bash
GET /usermanagement/users/1/change-password
Status: 200
Expected: Password change form (no current password visible)

# Then submit:
POST /api/usermanagement/users/1/change-password (JSON body)
Status: 200 OK
Expected: { success: true }
```

### Test 2: Role Management

#### List Roles
```bash
GET /usermanagement/roles
Status: 200
Expected: Table with roles and permission counts
```

#### Create Role
```bash
GET /usermanagement/roles/create
Status: 200
Expected: Form with permission checkboxes

# Then submit:
POST /api/usermanagement/roles
Status: 201 Created
Expected: { success: true }
```

#### View Role
```bash
GET /usermanagement/roles/1/view
Status: 200
Expected: Role details with permissions and assigned users
```

#### Edit Role
```bash
GET /usermanagement/roles/1/edit
Status: 200
Expected: Form with selected permissions

# Then submit:
PUT /api/usermanagement/roles/1
Status: 200 OK
Expected: { success: true }
```

### Test 3: Branch Management

#### List Branches
```bash
GET /usermanagement/branches
Status: 200
Expected: Table with branches and user counts
```

#### Create Branch
```bash
GET /usermanagement/branches/create
Status: 200
Expected: Form with geographic fields

# Then submit:
POST /api/usermanagement/branches
Status: 201 Created
Expected: { success: true }
```

#### View Branch
```bash
GET /usermanagement/branches/1/view
Status: 200
Expected: Branch details with assigned users
```

#### Edit Branch
```bash
GET /usermanagement/branches/1/edit
Status: 200
Expected: Form pre-filled with branch data

# Then submit:
PUT /api/usermanagement/branches/1
Status: 200 OK
Expected: { success: true }
```

### Test 4: Permissions Management

#### List Permissions
```bash
GET /usermanagement/permissions
Status: 200
Expected: Tabbed interface with permission table
```

#### Create Permission
```bash
GET /usermanagement/permissions/create
Status: 200
Expected: Form with module and action fields

# Then submit:
POST /api/usermanagement/permissions
Status: 201 Created
Expected: { success: true }
```

#### Edit Permission
```bash
GET /usermanagement/permissions/1/edit
Status: 200
Expected: Form pre-filled with permission data

# Then submit:
PUT /api/usermanagement/permissions/1
Status: 200 OK
Expected: { success: true }
```

### Test 5: Audit Logs

#### View Audit Logs
```bash
GET /usermanagement/audit-logs
Status: 200
Expected: Table with audit entries, filters, pagination
```

#### View Log Details
```
Click "View Details" modal
Expected: Popup showing:
  - Before values
  - After values
  - Change description
```

---

## 🛠️ Debugging Guide

### Issue: Views Not Rendering

**Symptom:** "Cannot find module 'ejs'" error

**Solution:**
```bash
npm install ejs
# Or check app.js has:
app.set('view engine', 'ejs');
```

---

### Issue: Form Submission Fails

**Symptom:** Form submitted but nothing happens

**Diagnosis:**
```javascript
// Check form action in browser dev tools:
// Should be: action="/api/usermanagement/users" (API, not view)
// Should NOT be: action="/usermanagement/users" (view)

// Check network tab:
// Should see POST to /api/usermanagement/...
// Should return JSON response
```

**Solution:**
1. Verify form `action` attribute points to API endpoint
2. Verify API endpoint exists and returns JSON
3. Check browser console for JavaScript errors
4. Check network tab for failed requests

---

### Issue: Authentication Fails

**Symptom:** Redirect to login on every request

**Diagnosis:**
```javascript
// Check authMiddleware in ViewController.js:
// Should extract token from localStorage (client) or bearer header

// Check token storage:
// Browser DevTools → Application → Local Storage
// Should have key 'auth_token' with JWT value
```

**Solution:**
1. Verify login API sets token in response
2. Verify JavaScript saves token to localStorage
3. Verify authMiddleware reads from correct location
4. Check token expiration time

---

### Issue: Role-Based Access Fails

**Symptom:** Admin-only views show for non-admin users

**Diagnosis:**
```javascript
// Check roleMiddleware in viewRoutes.js:
// Should verify user.roles includes required role

// Check route definition:
// Should have roleMiddleware(['admin'])
```

**Solution:**
1. Verify roleMiddleware properly extracts roles
2. Verify user record has correct roles in database
3. Check role names match exactly (case-sensitive)
4. Verify JWT contains complete roles array

---

### Issue: Styling Broken

**Symptom:** Ugly unstyled page

**Diagnosis:**
```html
<!-- Check layout.ejs has Bootstrap CDN: -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
```

**Solution:**
1. Verify CDN links in layout.ejs are correct
2. Check internet connection (CDN needs to load)
3. Check browser console for 404 errors
4. Test with `curl` if CDN is accessible

---

### Issue: Database Queries Fail

**Symptom:** 500 error when rendering view

**Diagnosis:**
```javascript
// Check ViewController.js console logs:
// Should see: "ViewController.renderUsers() called"
// Should see: "User.findAll() returned X records"

// Check app logs:
// Should see connection successful
// Should see query results
```

**Solution:**
1. Verify database connection is established
2. Verify migrations have run (tables exist)
3. Check database has sample data
4. Verify Sequelize includes are correct

---

## 📊 Performance Testing

### Load Test URLs
```bash
# Single user view (data retrieval)
ab -n 100 -c 10 http://localhost:3000/usermanagement/users

# With pagination (larger list)
ab -n 100 -c 10 http://localhost:3000/usermanagement/users?page=1&limit=50

# With search filter
ab -n 100 -c 10 http://localhost:3000/usermanagement/users?search=john
```

### Expected Performance
- List page: < 200ms
- Detail page: < 150ms
- With 10 concurrent users: < 500ms
- With search filter: < 300ms

### Optimization Tips
1. Add pagination limit (default 20-50 records)
2. Add database indexes on search fields
3. Cache role/permission lists (unlikely to change often)
4. Use `SELECT` fields to limit columns returned
5. Implement lazy loading for large relationships

---

## 🔗 Integration Checklist

- [ ] Copy views/ directory to project
- [ ] Copy ViewController.js to Controllers/
- [ ] Copy viewRoutes.js to routes/
- [ ] Update app.js with view routes registration
- [ ] Verify EJS engine configured
- [ ] Start server: `npm start`
- [ ] Load login page: http://localhost:3000/usermanagement/login
- [ ] Login with test user
- [ ] Navigate through each module
- [ ] Test create/edit/delete operations
- [ ] Verify audit logs record changes
- [ ] Check responsive design on mobile
- [ ] Test with multiple concurrent users
- [ ] Verify all error messages display
- [ ] Check form validation works
- [ ] Customize styling (optional)
- [ ] Deploy to production

---

## 📞 Getting Help

### Quick Fixes
1. Check browser console for JavaScript errors
2. Check server console for Express errors
3. Check Network tab for failed requests
4. Verify database connection
5. Check auth token in localStorage

### Debug Steps
1. Add `console.log()` in ViewController methods
2. Check SQL queries in database logs
3. Verify middleware execution order
4. Test API endpoints directly with Postman
5. Check file permissions on views/ directory

### Common Error Messages

| Error | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` |
| "connect ECONNREFUSED" | Start database server |
| "User not authenticated" | Login first, check token |
| "Permission denied" | Verify user role in database |
| "Column not found" | Run database migrations |
| "404 Not Found" | Check route URL spelling |
| "invalid method override" | Verify method override middleware |

---

## 📚 Understanding the Code

### ViewController Structure
```javascript
class ViewController {
  async renderUserList(req, res) {
    // 1. Get pagination params
    const page = req.query.page || 1;
    const limit = 20;
    
    // 2. Query database
    const users = await User.findAll({
      include: [Role, Branch],
      offset: (page - 1) * limit,
      limit
    });
    
    // 3. Prepare context for view
    const context = {
      users,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    };
    
    // 4. Render EJS template with context
    res.render('usermanagement/users/list', context);
  }
}
```

### View Route Structure
```javascript
router.get('/users', authMiddleware, roleMiddleware(['admin']), 
  (req, res) => {
    // Call ViewController method
    return ViewController.renderUserList(req, res);
  }
);
```

### View Template Structure
```ejs
<% include ../partials/layout %>

<div class="container-fluid mt-4">
  <h1>Users List</h1>
  
  <!-- Display data from context -->
  <table>
    <% users.forEach(user => { %>
      <tr>
        <td><%= user.fullName %></td>
        <td><%= user.email %></td>
      </tr>
    <% }) %>
  </table>
  
  <!-- Pagination links -->
  <% if(currentPage > 1) { %>
    <a href="?page=<%= currentPage - 1 %>">Previous</a>
  <% } %>
</div>
```

---

## 🎓 Best Practices

1. **Always authenticate** - No public access except /login
2. **Always authorize** - Check roles before showing data
3. **Always validate** - Client AND server validation
4. **Always escape** - EJS auto-escapes, but check user inputs
5. **Always handle errors** - Show friendly error messages
6. **Always log** - Record all significant actions
7. **Always paginate** - Load incrementally, not all at once
8. **Always optimize** - Use database indexes and caching

---

**Status:** ✅ Ready for Deployment  
**Version:** 1.0  
**Created:** February 10, 2026
