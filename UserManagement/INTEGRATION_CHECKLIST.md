# 📋 Integration Checklist

Complete this checklist to integrate the User Management System into your OAEMS application.

## Phase 1: Preparation ✅

- [ ] **1.1** Review IMPLEMENTATION_SUMMARY.md to understand what was created
- [ ] **1.2** Review DEPENDENCIES.md to understand required packages
- [ ] **1.3** Backup your current database (recommended: `mysqldump oaems > backup.sql`)
- [ ] **1.4** Review INTEGRATION_GUIDE.js for step-by-step instructions

## Phase 2: Dependencies Installation 📦

- [ ] **2.1** Run: `npm install bcryptjs jsonwebtoken joi cookie-parser`
- [ ] **2.2** Verify installation: `npm list bcryptjs jsonwebtoken joi cookie-parser`
- [ ] **2.3** Update package.json (if not auto-updated)
- [ ] **2.4** Run `npm install` to ensure all dependencies are locked

## Phase 3: Code Integration 🔗

### 3.1 Update Models/index.js
- [ ] **3.1.1** Open: `Models/index.js`
- [ ] **3.1.2** Add UserManagement models at the end of sequelize.define() calls
- [ ] **3.1.3** Add associations section for UserManagement relationships
- [ ] **3.1.4** Export all UserManagement models

Refer to: `UserManagement/INTEGRATION_GUIDE.js` - Section: "Step 1: Update Models/index.js"

### 3.2 Update Main app.js
- [ ] **3.2.1** Open: `app.js`
- [ ] **3.2.2** Add cookie-parser middleware BEFORE route handlers
- [ ] **3.2.3** Import userManagementRoutes: `const userManagementRoutes = require('./UserManagement/routes/userManagementRoutes');`
- [ ] **3.2.4** Register routes: `app.use('/api/um', userManagementRoutes);`
- [ ] **3.2.5** Ensure auth middleware is available to UserManagement

Refer to: `UserManagement/INTEGRATION_GUIDE.js` - Section: "Step 2: Update app.js"

### 3.3 Setup Environment Variables
- [ ] **3.3.1** Open your `.env` file
- [ ] **3.3.2** Add JWT_SECRET: `JWT_SECRET=your-very-secret-key-min-32-chars`
- [ ] **3.3.3** Add JWT expiry (optional): `JWT_EXPIRY=15m`
- [ ] **3.3.4** Add Refresh Token expiry (optional): `REFRESH_TOKEN_EXPIRY=7d`
- [ ] **3.3.5** Save `.env` file

Refer to: `UserManagement/INTEGRATION_GUIDE.js` - Section: "Step 3: Environment Variables"

## Phase 4: Database Migrations 🗄️

### 4.1 Create Migration Files
```bash
# Copy SQL from migrations/ folder to create migration files
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

- [ ] **4.1.1** All migration files created
- [ ] **4.1.2** Migration files populated with SQL from `UserManagement/migrations/`
- [ ] **4.1.3** Test migration with: `npx sequelize-cli db:migrate:undo:all` (test on backup DB first!)

### 4.2 Apply Migrations
- [ ] **4.2.1** Run: `npx sequelize-cli db:migrate`
- [ ] **4.2.2** Check output for: "Sequelize CLI v.x.x... Loaded configuration file..."
- [ ] **4.2.3** Verify all 11 tables created in MySQL
- [ ] **4.2.4** Check MySQL: `USE oaems; SHOW TABLES;`

## Phase 5: Seed Initial Data 🌱

### 5.1 Create Seeder
- [ ] **5.1.1** Copy `UserManagement/seeders/20260224-initial-roles-permissions.js` to your `seeders/` folder
- [ ] **5.1.2** Verify file is in place: `ls seeders/`

### 5.2 Run Seed
- [ ] **5.2.1** Run: `npx sequelize-cli db:seed:all`
- [ ] **5.2.2** Check output for success messages
- [ ] **5.2.3** Verify data in MySQL: `SELECT * FROM roles;`
- [ ] **5.2.4** Verify permissions: `SELECT * FROM permissions;`

## Phase 6: Application Testing 🧪

### 6.1 Start Application
- [ ] **6.1.1** Run: `npm start`
- [ ] **6.1.2** Check console for: "Server running on port..."
- [ ] **6.1.3** Check console for: "Database connected successfully"
- [ ] **6.1.4** No errors in console

### 6.2 Health Check
- [ ] **6.2.1** Open Postman or use curl

Test endpoints (see QUICKSTART.md for examples):

```bash
# Test 1: Login
curl -X POST http://localhost:3000/api/um/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin@example.com","password":"SecurePass123"}'
```

- [ ] **6.2.2** Received access token in response
- [ ] **6.2.3** Can copy accessToken from response

```bash
# Test 2: Get Current User
curl http://localhost:3000/api/um/auth/me \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

- [ ] **6.2.4** Received current user data

```bash
# Test 3: List Users
curl http://localhost:3000/api/um/users \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

- [ ] **6.2.5** Received list of users
- [ ] **6.2.6** Pagination working (limit, offset, count)

### 6.3 Full Endpoint Testing
- [ ] **6.3.1** Test create user endpoint
- [ ] **6.3.2** Test get user endpoint
- [ ] **6.3.3** Test update user endpoint
- [ ] **6.3.4** Test assign role to user
- [ ] **6.3.5** Test role endpoints
- [ ] **6.3.6** Test permission endpoints
- [ ] **6.3.7** Test branch endpoints
- [ ] **6.3.8** Test audit log viewing

Use QUICKSTART.md for detailed endpoint examples!

## Phase 7: Integration with Existing Code 🔄

### 7.1 Use UserService in Controllers
- [ ] **7.1.1** In existing controllers, import UserService: 
  ```javascript
  const UserService = require('../UserManagement/services/UserService');
  ```
- [ ] **7.1.2** Use UserService methods instead of direct API calls
- [ ] **7.1.3** Remove or comment out old API-based user fetching

### 7.2 Update Auth for Other Controllers
- [ ] **7.2.1** All protected routes should use `authMiddleware` from UserManagement
- [ ] **7.2.2** Import: `const { authMiddleware, roleMiddleware } = require('./UserManagement/middleware/auth');`
- [ ] **7.2.3** Use on protected routes: `app.get('/protected', authMiddleware, handler);`

### 7.3 Remove Legacy User Code
- [ ] **7.3.1** Comment out old CurrentUserManagement code
- [ ] **7.3.2** Remove API-based user fetching from existing controllers
- [ ] **7.3.3** Update references to use new UserRepository/UserService

## Phase 8: Production Setup 🚀

### 8.1 Security Hardening
- [ ] **8.1.1** Change JWT_SECRET to strong random value (32+ characters)
- [ ] **8.1.2** Enable HTTPS in production
- [ ] **8.1.3** Set cookie.secure = true in auth middleware
- [ ] **8.1.4** Enable CORS restrictions: specify allowed origins
- [ ] **8.1.5** Set rate limiting parameters appropriately

### 8.2 Database Optimization
- [ ] **8.2.1** Verify all indexes are created: `SHOW INDEXES FROM users;`
- [ ] **8.2.2** Run: `ANALYZE TABLE users, roles, permissions, branches;`
- [ ] **8.2.3** Enable query logging to identify slow queries

### 8.3 Performance Testing
- [ ] **8.3.1** Test with load (e.g., 100 concurrent users)
- [ ] **8.3.2** Monitor response times (should be < 200ms)
- [ ] **8.3.3** Monitor database connections
- [ ] **8.3.4** Check memory usage

### 8.4 Monitoring & Logging
- [ ] **8.4.1** Setup Audit Log viewing endpoint
- [ ] **8.4.2** Setup admin dashboard for user management
- [ ] **8.4.3** Configure alerts for failed logins
- [ ] **8.4.4** Setup log rotation for application logs

## Phase 9: Documentation & Training 📚

- [ ] **9.1** Share README.md with team
- [ ] **9.2** Share QUICKSTART.md with developers
- [ ] **9.3** Conduct team training on API usage
- [ ] **9.4** Document any customizations made
- [ ] **9.5** Create runbook for common admin tasks

## Phase 10: Deployment 🎉

### 10.1 Pre-Deployment
- [ ] **10.1.1** Run full test suite
- [ ] **10.1.2** Verify all endpoints working
- [ ] **10.1.3** Check error handling
- [ ] **10.1.4** Verify audit logging

### 10.2 Deployment
- [ ] **10.2.1** Deploy to staging first
- [ ] **10.2.2** Run migrations on staging: `npx sequelize-cli db:migrate`
- [ ] **10.2.3** Run seeds on staging: `npx sequelize-cli db:seed:all`
- [ ] **10.2.4** Smoke test on staging
- [ ] **10.2.5** Deploy to production
- [ ] **10.2.6** Run migrations on production
- [ ] **10.2.7** Run seeds on production
- [ ] **10.2.8** Verify production endpoints

### 10.3 Post-Deployment
- [ ] **10.3.1** Monitor error logs
- [ ] **10.3.2** Monitor performance metrics
- [ ] **10.3.3** Check user reports for issues
- [ ] **10.3.4** Document any issues found
- [ ] **10.3.5** Plan rollback if needed

---

## 📊 Checklist Progress Summary

**Total Items:** 110+

**Phases:**
- [ ] Phase 1: Preparation (4 items)
- [ ] Phase 2: Dependencies (4 items)
- [ ] Phase 3: Code Integration (12 items)
- [ ] Phase 4: Database Migrations (9 items)
- [ ] Phase 5: Seed Initial Data (4 items)
- [ ] Phase 6: Application Testing (9 items)
- [ ] Phase 7: Integration with Existing Code (5 items)
- [ ] Phase 8: Production Setup (9 items)
- [ ] Phase 9: Documentation & Training (5 items)
- [ ] Phase 10: Deployment (10 items)

---

## 🆘 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| `Cannot find module 'bcryptjs'` | Run `npm install bcryptjs jsonwebtoken joi cookie-parser` |
| `JWT_SECRET not found` | Add JWT_SECRET to .env file |
| `Migrations not running` | Ensure sequelize-cli is installed: `npm install --save-dev sequelize-cli` |
| `Database connection errors` | Check .env database credentials match your MySQL setup |
| `Port already in use` | Change PORT in .env or kill existing process |
| `Audit logs not showing` | Ensure auditMiddleware is attached to express app |
| `Login returning 401` | Verify user exists, password is correct, account not locked |
| `Tokens expiring too fast` | Check JWT_EXPIRY in .env, default should be 15m |

---

## ✨ Success Criteria

You know everything is working when:

✅ All npm packages installed
✅ All 11 database tables created
✅ Initial roles and permissions seeded
✅ Login endpoint returns access token
✅ Can authenticate with returned token
✅ All CRUD operations working
✅ Audit logs recording actions
✅ Rate limiting working on login
✅ Users can be assigned roles and branches
✅ Permissions enforced on protected endpoints

---

**Next Step:** Start with Phase 1 → Work through sequentially → Test at each phase

Good luck! 🚀
