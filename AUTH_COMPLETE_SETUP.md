# 🔐 OAEMS Authentication System - Complete Setup Guide

## Overview

The OAEMS application now has a **complete, production-ready authentication system** that includes:

✅ Local user authentication (no external APIs)  
✅ JWT token generation and validation  
✅ Session management with express-session  
✅ Role-based access control (RBAC)  
✅ Login attempt tracking & account lockout  
✅ Password hashing with bcryptjs  
✅ Audit logging for security events  
✅ CSRF protection  
✅ Rate limiting on login attempts  

---

## 🔧 Installation & Setup

### 1. Required Dependencies

Make sure these are installed:

```bash
npm install jwt bcryptjs express-session cookie-parser connect-flash
```

Or install individually:
```bash
npm install jsonwebtoken
npm install bcryptjs
npm install express-session
npm install cookie-parser
npm install connect-flash
```

### 2. Environment Variables

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-very-secure-secret-key-change-this-in-production
JWT_EXPIRE=24h

# Session Configuration
SESSION_SECRET=your-session-secret-key-change-this-in-production
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=oaems_db

# Port
PORT=3006
```

### 3. Database Setup

Run migrations to create user management tables:

```bash
# Using Sequelize CLI
npx sequelize-cli db:migrate

# You should see these tables created:
# - Users
# - Roles
# - Permissions
# - RolePermissions
# - UserRoles
# - UserBranches
# - LoginAttempts
# - AuditLogs
```

### 4. Seed Initial Data

```bash
# Create admin user
npx sequelize-cli db:seed:all

# Or manually create an admin user:
# INSERT INTO Users (...) VALUES (...)
```

### 5. Verify app.js Configuration

Your `app.js` should have:

```javascript
// 1. Require auth middleware
const { authMiddleware, roleMiddleware } = require('./Middlewares/authMiddleware');

// 2. Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  },
}));

// 3. Auth routes
const authRouter = require('./routes/authRouter');
app.use('/auth', authRouter);

// 4. UserManagement routes
const userManagementRoutes = require('./UserManagement/routes/userManagementRoutes');
app.use('/api/usermanagement', userManagementRoutes);
```

---

## 📋 Authentication Flow

### Login Flow

```
User visits /auth/login
    ↓
Views login form (GET /auth/login)
    ↓
User enters email/password
    ↓
Form submits (POST /auth/login)
    ↓
Auth.js validates credentials
    ↓
Password verified via bcryptjs.compare()
    ↓
JWT token generated
    ↓
Session stored with token
    ↓
Redirect to /dashboard
```

### Protected Resource Access Flow

```
User makes request to protected resource
    ↓
authMiddleware checks req.session.token
    ↓
Token verified with jwt.verify()
    ↓
User data decoded from JWT
    ↓
roleMiddleware checks user roles
    ↓
User authorized? Yes → Allow access
    ↓
User authorized? No → Deny with 403 Forbidden
```

### Logout Flow

```
User clicks Logout
    ↓
Sends GET /auth/logout
    ↓
Session destroyed
    ↓
Cookies cleared
    ↓
Redirect to /auth/login
```

---

## 🔐 API Endpoints

### Authentication Endpoints

#### Login
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded

Input:
  email: user@example.com    (or username)
  password: password123

Response (Success - 200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": ["user", "manager"]
  },
  "message": "Login successful"
}

Response (Error - 401):
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### Logout
```
GET /auth/logout

Response: Redirect to /auth/login
```

#### Get Current User
```
GET /auth/me
Headers:
  Authorization: Bearer {token}  (optional, uses session)

Response (Success - 200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "roles": ["user"]
  }
}

Response (Error - 401):
{
  "success": false,
  "message": "Not authenticated"
}
```

#### Register (if enabled)
```
POST /auth/register
Content-Type: application/x-www-form-urlencoded

Input:
  firstName: John
  lastName: Doe
  email: john@example.com
  username: johndoe
  password: password123
  passwordConfirm: password123

Response (Success - 302):
Redirect to /auth/login with success message

Response (Error - 400):
{
  "success": false,
  "message": "Email already in use"
}
```

---

## 🛡️ Security Features

### 1. Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Salted and stretched for protection
- Never stored in plain text
- Never sent back in responses

### 2. JWT Tokens
- Signed with secret key
- 24-hour expiration
- Verified on every protected request
- Payload includes user roles and permissions

### 3. Session Management
- Express-session stores user data server-side
- HttpOnly cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- SameSite policy prevents CSRF

### 4. Account Lockout
- Tracks failed login attempts
- Locks account after 5 failed attempts
- 30-minute lockout period
- Automatic unlock after grace period

### 5. CSRF Protection
- CSRF tokens generated for forms
- Tokens verified on POST/PUT/DELETE
- One token per session

### 6. Rate Limiting
- Max 5 login attempts per 15 minutes per IP
- 429 Too Many Requests response
- Prevents brute force attacks

### 7. Audit Logging
- All login attempts logged
- Successful and failed tracked
- IP address and user agent recorded
- Admin can review in audit logs

---

## 🎯 Using Auth in Your Routes

### Protect a Route with Auth

```javascript
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../Middlewares/authMiddleware');

// Require authentication
router.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// Require admin role
router.post('/admin/settings', 
  authMiddleware, 
  roleMiddleware(['admin']), 
  (req, res) => {
    // Only admins can access
  }
);

// Multiple roles allowed
router.get('/reports', 
  authMiddleware, 
  roleMiddleware(['admin', 'manager', 'analyst']), 
  (req, res) => {
    // Anyone with these roles
  }
);
```

### Access User Info in Route

```javascript
router.get('/profile', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const userRoles = req.user.roles;
  
  res.json({
    message: `Welcome ${req.user.firstName}`,
    user: req.user
  });
});
```

### Check User in EJS Template

```ejs
<% if (user) { %>
  <p>Welcome, <%= user.firstName %>!</p>
  <p>Your roles: <%= user.roles.join(', ') %></p>
<% } else { %>
  <p><a href="/auth/login">Please login</a></p>
<% } %>
```

---

## 👤 User Management

### Create a User (Admin Only)

```bash
POST /api/usermanagement/users
Content-Type: application/json
Authorization: Bearer {token}

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "defaultBranchId": "branch-uuid",
  "status": "active"
}
```

### Update User

```bash
PUT /api/usermanagement/users/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "firstName": "Jane",
  "lastName": "Smith",
  "status": "active"
}
```

### Assign Role to User

```bash
POST /api/usermanagement/users/{userId}/roles
Content-Type: application/json
Authorization: Bearer {token}

{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

### Change Password

```bash
POST /auth/change-password
Content-Type: application/json
Authorization: Bearer {token}

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456",
  "confirmPassword": "newpassword456"
}
```

---

## 🧪 Testing Authentication

### Test Login

```bash
# Open browser
curl -X POST http://localhost:3006/auth/login \
  -d "email=admin@example.com&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -c cookies.txt

# Now use cookies in subsequent requests
curl http://localhost:3006/auth/me -b cookies.txt
```

### Test Protected Route

```bash
# Should redirect to login (no session)
curl http://localhost:3006/usermanagement/users

# After login, should show users list
curl http://localhost:3006/usermanagement/users -b cookies.txt
```

### Test Role-Based Access

```bash
# As admin (works)
curl -X DELETE http://localhost:3006/api/usermanagement/users/123 \
  -b cookies.txt \
  -H "Authorization: Bearer {token}"

# As user (403 Forbidden)
curl -X DELETE http://localhost:3006/api/usermanagement/users/123 \
  -b cookies.txt \
  -H "Authorization: Bearer {token}"
  # Returns: "You do not have permission"
```

---

## 🐛 Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'token')"

**Cause:** Response structure doesn't match expected format

**Solution:** Check your API returns correct response format:
```javascript
res.json({
  success: true,
  data: {
    token: "jwt-token-here",
    user: { /* user data */ }
  }
});
```

### Issue: Session Not Persisting

**Cause:** Session middleware not configured correctly

**Solution:** Verify in app.js:
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
```

### Issue: JWT Verification Fails

**Cause:** Wrong secret or token expired

**Solution:** 
1. Check that `JWT_SECRET` in `.env` is correct
2. Check token expiration: `jwt.decode(token)`
3. Use same secret for signing and verifying

### Issue: Roles Not Working

**Cause:** User roles not loaded in session

**Solution:** Ensure roles are included in user query:
```javascript
const user = await User.findOne({
  include: [{ association: 'roles' }]
});
```

### Issue: Login Page Shows "Invalid JSON"

**Cause:** Rendering wrong template or missing locals

**Solution:** Check login.ejs has proper form action:
```ejs
<form action="/auth/login" method="POST">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Login</button>
</form>
```

### Issue: CORS Errors with API

**Cause:** Cross-origin requests blocked

**Solution:** Add CORS in app.js:
```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📊 Security Checklist

- [x] Passwords hashed with bcryptjs
- [x] JWT tokens signed and verified
- [x] Session cookies httpOnly flag
- [x] Secure flag in production
- [x] SameSite CSRF protection
- [x] Login attempt rate limiting
- [x] Account lockout after failed attempts
- [x] Audit logging enabled
- [x] User roles enforced
- [x] Password validation
- [x] XSS prevention with EJS escaping
- [x] SQL injection prevention with Sequelize
- [x] Environment variables for secrets

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install --save jsonwebtoken bcryptjs express-session cookie-parser connect-flash
```

### Step 2: Create `.env`
```env
JWT_SECRET=super-secret-key-change-in-production
SESSION_SECRET=session-secret-key-change-in-production
NODE_ENV=development
PORT=3006
```

### Step 3: Run Migrations
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Step 4: Start Server
```bash
npm start
```

### Step 5: Access App
```
Login: http://localhost:3006/auth/login
Dashboard: http://localhost:3006/dashboard
Users: http://localhost:3006/usermanagement/users
```

### Step 6: Login with Test Admin
```
Email: admin@example.com
Password: admin123  (or check seeders for actual password)
```

---

## 📚 Related Files

- **Auth.js** - Authentication controller
- **authRouter.js** - Authentication routes
- **authMiddleware.js** - Authentication & authorization middleware
- **UserManagement/services/AuthService.js** - Core auth logic
- **UserManagement/models/User.js** - User model
- **views/auth/login.ejs** - Login page template

---

## 🔗 Next Steps

1. Configure database migrations
2. Create admin user via seeder
3. Test login flow
4. Integrate into your app routes
5. Test role-based access
6. Set up audit logging review
7. Customize login page styling
8. Deploy to production with secure secrets

---

**Status:** ✅ Complete  
**Version:** 2.0  
**Updated:** February 10, 2026  
**Type:** Production-Ready Authentication System
