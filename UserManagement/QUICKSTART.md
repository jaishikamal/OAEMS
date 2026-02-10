# User Management System - Quick Start Guide

## 📋 Overview

This is an **enterprise-grade user management system** built with Express.js following the **Repository Pattern** architecture. It provides:

- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ Role-Based Access Control (RBAC)
- ✅ Permission-Based Authorization
- ✅ Multi-Role Support
- ✅ Multi-Branch Support
- ✅ Account Locking & Security
- ✅ Audit Logging
- ✅ Login Attempt Tracking
- ✅ Comprehensive API Endpoints

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken joi cookie-parser
```

### 2. Environment Setup

Create or update your `.env` file:

```env
# JWT Secrets
ACCESS_TOKEN_SECRET=your-secure-access-secret-key-change-this-12345
REFRESH_TOKEN_SECRET=your-secure-refresh-secret-key-change-this-67890
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
REFRESH_TOKEN_EXPIRY_DAYS=7

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=oaems
NODE_ENV=development
```

### 3. Update Models/index.js

Add UserManagement models to your Models/index.js:

```javascript
// Load UserManagement models
try {
  const userManagementModelsPath = path.join(__dirname, "../UserManagement/models");
  fs.readdirSync(userManagementModelsPath)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file !== "index.js" &&
        file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      const model = require(path.join(userManagementModelsPath, file))(
        sequelize,
        Sequelize.DataTypes,
      );
      db[model.name] = model;
    });
} catch (error) {
  console.log("UserManagement models error:", error.message);
}
```

### 4. Update app.js

Add routes to your express app:

```javascript
const cookieParser = require("cookie-parser");
const createUserManagementRoutes = require("./UserManagement/routes/userManagementRoutes");
const { auditMiddleware } = require("./UserManagement/middleware/auth");

app.use(cookieParser());

const db = require("./Models");
const umRoutes = createUserManagementRoutes(db);
app.use("/api/um", auditMiddleware(db), umRoutes);
```

### 5. Create and Run Migrations

Create migration files using Sequelize CLI:

```bash
npx sequelize-cli migration:create --name create-users-table
npx sequelize-cli migration:create --name create-roles-table
npx sequelize-cli migration:create --name create-permissions-table
npx sequelize-cli migration:create --name create-branches-table
npx sequelize-cli migration:create --name create-user-roles-table
npx sequelize-cli migration:create --name create-user-branches-table
npx sequelize-cli migration:create --name create-user-permissions-table
npx sequelize-cli migration:create --name create-role-permissions-table
npx sequelize-cli migration:create --name create-audit-logs-table
npx sequelize-cli migration:create --name create-login-attempts-table
npx sequelize-cli migration:create --name create-refresh-tokens-table
```

Then run migrations:

```bash
npx sequelize-cli db:migrate
```

### 6. Seed Initial Data

Run seeders:

```bash
npx sequelize-cli db:seed:all
```

## 📚 API Endpoints

### Authentication

```
POST   /api/um/auth/login              → Login user
POST   /api/um/auth/refresh-token      → Get new access token
POST   /api/um/auth/logout             → Logout user
GET    /api/um/auth/me                 → Get current user
```

### Users

```
POST   /api/um/users                   → Create user
GET    /api/um/users                   → List users
GET    /api/um/users/search            → Search users
GET    /api/um/users/:userId           → Get user details
PUT    /api/um/users/:userId           → Update user
DELETE /api/um/users/:userId           → Delete user
POST   /api/um/users/:userId/roles/:roleId              → Assign role
DELETE /api/um/users/:userId/roles/:roleId              → Remove role
POST   /api/um/users/:userId/branches/:branchId         → Assign branch
DELETE /api/um/users/:userId/branches/:branchId         → Remove branch
POST   /api/um/users/:userId/permissions/:permissionId  → Assign permission
DELETE /api/um/users/:userId/permissions/:permissionId  → Remove permission
POST   /api/um/users/:userId/change-password            → Change password
POST   /api/um/users/:userId/reset-password             → Reset password (Admin)
POST   /api/um/users/:userId/suspend                    → Suspend user
POST   /api/um/users/:userId/activate                   → Activate user
```

### Roles

```
POST   /api/um/roles                   → Create role
GET    /api/um/roles                   → List roles
GET    /api/um/roles/search            → Search roles
GET    /api/um/roles/system            → Get system roles
GET    /api/um/roles/:roleId           → Get role details
PUT    /api/um/roles/:roleId           → Update role
DELETE /api/um/roles/:roleId           → Delete role
POST   /api/um/roles/:roleId/permissions/:permissionId    → Assign permission
DELETE /api/um/roles/:roleId/permissions/:permissionId    → Remove permission
POST   /api/um/roles/:roleId/permissions                  → Bulk assign permissions
```

### Permissions

```
POST   /api/um/permissions             → Create permission
GET    /api/um/permissions             → List permissions
GET    /api/um/permissions/search      → Search permissions
GET    /api/um/permissions/system      → Get system permissions
GET    /api/um/permissions/module/:module     → Get by module
GET    /api/um/permissions/grouped/by-module → Group by module
GET    /api/um/permissions/:permissionId     → Get permission
PUT    /api/um/permissions/:permissionId     → Update permission
DELETE /api/um/permissions/:permissionId     → Delete permission
GET    /api/um/users/:userId/permissions    → Get user permissions
GET    /api/um/roles/:roleId/permissions    → Get role permissions
```

### Branches

```
POST   /api/um/branches                → Create branch
GET    /api/um/branches                → List branches
GET    /api/um/branches/active         → Get active branches
GET    /api/um/branches/search         → Search branches
GET    /api/um/branches/level/:level   → Get by level
GET    /api/um/branches/:branchId      → Get branch details
PUT    /api/um/branches/:branchId      → Update branch
DELETE /api/um/branches/:branchId      → Delete branch
GET    /api/um/branches/:parentBranchId/children  → Get child branches
POST   /api/um/branches/:branchId/users/:userId   → Add user to branch
DELETE /api/um/branches/:branchId/users/:userId   → Remove user from branch
```

## 💻 Usage Examples

### 1. Login

```bash
curl -X POST http://localhost:3000/api/um/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "admin@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": ["ADMIN"],
      "branches": [],
      "status": "active"
    }
  }
}
```

### 2. Create User (Admin Only)

```bash
curl -X POST http://localhost:3000/api/um/users \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "SecurePass123"
  }'
```

### 3. Assign Role to User (Admin Only)

```bash
curl -X POST http://localhost:3000/api/um/users/user-id/roles/role-id \
  -H "Authorization: Bearer <accessToken>"
```

### 4. Create Role (Admin Only)

```bash
curl -X POST http://localhost:3000/api/um/roles \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "RISK_MANAGER",
    "name": "Risk Manager",
    "description": "Manages risk assessments"
  }'
```

### 5. Create Permission (Admin Only)

```bash
curl -X POST http://localhost:3000/api/um/permissions \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "user.create",
    "name": "Create User",
    "module": "UserManagement",
    "resource": "user",
    "action": "create"
  }'
```

## 🔐 Security Features

### Password Security
- ✅ Hashed with bcryptjs (10 salt rounds)
- ✅ Minimum 8 characters
- ✅ Must contain uppercase, lowercase, and numbers

### Account Protection
- ✅ Auto-lock after 5 failed login attempts
- ✅ Locked for 30 minutes
- ✅ Tracks failed login reasons
- ✅ IP address logging

### Session Management
- ✅ Access tokens: 15 minutes
- ✅ Refresh tokens: 7 days
- ✅ Token revocation support
- ✅ HttpOnly cookies

### Audit Trail
- ✅ Logs all user actions
- ✅ Tracks changes (before/after)
- ✅ Records IP and user agent
- ✅ Action status (success/failure)

## 🔑 System Roles

Default system roles (read-only):

1. **ADMIN** - Full system access
2. **BRANCH_MANAGER** - Manages branch operations
3. **RISK_MANAGER** - Manages risk assessments
4. **AUDITOR** - Audit and compliance
5. **REVIEWER** - Reviews submissions
6. **STAFF** - General staff member

## 📊 Directory Structure

```
UserManagement/
├── controllers/       # Request handlers
├── services/         # Business logic
├── repositories/     # Data access layer
├── models/           # Database models
├── middleware/       # Express middleware
├── validators/       # Input validation
├── routes/           # API routes
├── seeders/          # Database seeds
├── migrations/       # Database migrations
├── INTEGRATION_GUIDE.js
└── README.md
```

## 🛠 Troubleshooting

### Issue: "No token provided"
**Solution:** Include `Authorization: Bearer <token>` header

### Issue: "User not found"
**Solution:** Check email/username spelling, ensure user exists

### Issue: "Insufficient permissions"
**Solution:** Assign required role to user

### Issue: "User account is locked"
**Solution:** Wait 30 minutes or have admin unlock

### Issue: Models not loading
**Solution:** Check INTEGRATION_GUIDE.js for Models/index.js updates

## 🚢 Production Deployment

### Recommended Settings

```env
NODE_ENV=production
ACCESS_TOKEN_SECRET=<USE_STRONG_RANDOM_STRING>
REFRESH_TOKEN_SECRET=<USE_DIFFERENT_STRONG_STRING>
```

### Security Checklist

- [ ] Use HTTPS only
- [ ] Set strong JWT secrets
- [ ] Enable CORS properly
- [ ] Use environment variables
- [ ] Enable rate limiting
- [ ] Use secure cookies (httpOnly, Secure, SameSite)
- [ ] Implement request logging
- [ ] Set up monitoring
- [ ] Regular backups
- [ ] Database encryption

## 📝 License

This code is provided as-is for your OAEMS (Open Accounting & Expense Management System)

## 🤝 Support

For issues or questions, refer to:
- README.md - Full documentation
- INTEGRATION_GUIDE.js - Integration steps
- Test endpoints using Postman
