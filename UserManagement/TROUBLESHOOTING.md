# 🚨 Troubleshooting & FAQ Guide

## Common Issues and Solutions

### Installation & Setup

#### ❌ "Cannot find module 'bcryptjs'"
**Cause:** Dependencies not installed
**Solution:**
```bash
npm install bcryptjs jsonwebtoken joi cookie-parser
npm install  # Reinstall all dependencies
npm list bcryptjs  # Verify installation
```

#### ❌ "npm ERR! code ERESOLVE"
**Cause:** Dependency version conflict
**Solution:**
```bash
npm install --legacy-peer-deps bcryptjs jsonwebtoken joi cookie-parser
```

#### ❌ "Port 3000 already in use"
**Cause:** Another process using the same port
**Solution:**
- **Windows:**
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```
- **macOS/Linux:**
  ```bash
  lsof -i :3000
  kill -9 <PID>
  ```
- **Alternative:** Change PORT in `.env` file

---

### Database & Migrations

#### ❌ "sequelize-cli: command not found"
**Cause:** Sequelize CLI not installed
**Solution:**
```bash
npm install --save-dev sequelize-cli
npx sequelize-cli --version  # If it works, good
```

#### ❌ "Access denied for user 'root'@'localhost'"
**Cause:** Database credentials incorrect
**Solution:**
1. Check `.env` file for correct MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=oaems
   DB_PORT=3306
   ```
2. Test MySQL connection:
   ```bash
   mysql -h localhost -u root -p  # Then enter password
   ```
3. If using Windows and MySQL not installed:
   - Install MySQL Server from mysql.com
   - Run MySQL setup wizard
   - Create database: `CREATE DATABASE oaems;`

#### ❌ "Requested sequence 'users_id_seq' does not exist"
**Cause:** Migrations not run
**Solution:**
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Run all pending migrations
npx sequelize-cli db:migrate

# If error, undo and retry
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

#### ❌ "Duplicate entry in database during seeding"
**Cause:** Seeds run multiple times
**Solution:**
```bash
# Check what was seeded
USE oaems;
SELECT * FROM roles;  -- Should show 6 roles

# If already seeded, delete old seeds
DELETE FROM role_permissions;
DELETE FROM roles;
DELETE FROM permissions;

# Then reseed
npx sequelize-cli db:seed:all
```

#### ❌ "Table doesn't exist" error
**Cause:** Migrations not completed
**Solution:**
```bash
# Check which migrations failed
npx sequelize-cli db:migrate:status

# You should see: ✓ status (up)

# If not, run migrations again
npx sequelize-cli db:migrate

# Verify tables created
mysql -u root -p oaems -e "SHOW TABLES;"
```

---

### Authentication & JWT

#### ❌ "JWT_SECRET not found"
**Cause:** Environment variable not set
**Solution:**
1. Open `.env` file in root directory
2. Add: `JWT_SECRET=your-super-secret-key-at-least-32-characters-long`
3. Example: `JWT_SECRET=a9f3k2l9m4n6p2q8r5s7t1u3v4w6x8y0`
4. Save file
5. Restart application: `npm start`

#### ❌ "Invalid token" when using access token
**Cause:** Multiple possible reasons
**Solution Method 1 - Verify format:**
```bash
# Authorization header should be:
Authorization: Bearer <token_here>

# NOT:
Authorization: <token_here>
Authorization: Bearer"<token_here>"  # Space missing
```

**Solution Method 2 - Check token expiry:**
- Default expiry is 15 minutes (900 seconds)
- If token > 15m old, use refresh token endpoint:
- `POST /api/um/auth/refresh-token`

**Solution Method 3 - Verify JWT_SECRET matches:**
```bash
# All servers/workers must have SAME JWT_SECRET
# If different, tokens won't validate
```

#### ❌ "Cannot read property 'user' of undefined"
**Cause:** authMiddleware not applied to route
**Solution:**
```javascript
// WRONG - missing authMiddleware:
app.get('/api/um/users', userController.listUsers);

// CORRECT - authMiddleware included:
app.get('/api/um/users', authMiddleware, userController.listUsers);
```

#### ❌ "Login returns 401 Unauthorized"
**Cause:** Invalid credentials
**Solution:**
1. Verify user exists:
   ```sql
   SELECT id, email, username FROM users WHERE email='admin@example.com';
   ```
2. If user doesn't exist, create one:
   ```bash
   POST /api/um/users
   Authorization: Bearer <admin_token>
   {
     "firstName": "Admin",
     "lastName": "User",
     "email": "admin@example.com",
     "username": "admin",
     "password": "SecurePass123"
   }
   ```
3. Try login with username EXACTLY as created
4. Check password matches (case-sensitive!)

---

### User Management

#### ❌ "Cannot create user - email already exists"
**Cause:** Duplicate email in system
**Solution:**
```sql
-- Check existing users
USE oaems;
SELECT id, email, username FROM users WHERE email='test@example.com';

-- If user disabled, update it instead:
UPDATE users SET firstName='New', lastName='Name' WHERE email='test@example.com';

-- Or use different email:
-- test2@example.com instead of test@example.com
```

#### ❌ "Cannot create user - password too weak"
**Cause:** Password doesn't meet requirements
**Solution:**
Password requirements:
- ✅ Minimum 8 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)

Examples:
- ✅ `SecurePass123` - OK
- ✅ `MyPassword999` - OK
- ❌ `password123` - NO uppercase
- ❌ `PASSWORD123` - NO lowercase
- ❌ `Pass99` - Only 6 chars
- ❌ `password` - NO numbers

#### ❌ "User locked - too many login attempts"
**Cause:** 5 failed login attempts
**Solution:**
1. Wait 30 minutes (auto unlocks)
2. Or admin unlock:
   ```bash
   POST /api/um/users/{userId}/unlock
   Authorization: Bearer <admin_token>
   ```
3. Check login history:
   ```bash
   GET /api/um/audit-logs?userId={userId}
   Authorization: Bearer <admin_token>
   ```

#### ❌ "Cannot assign role to user"
**Cause:** Multiple possible reasons
**Solution:**
1. Verify role exists:
   ```bash
   GET /api/um/roles
   Authorization: Bearer <admin_token>
   
   # Look for role code like "ADMIN", "BRANCH_MANAGER"
   ```
2. Verify user exists:
   ```bash
   GET /api/um/users/{userId}
   Authorization: Bearer <admin_token>
   ```
3. Verify endpoint format:
   ```bash
   POST /api/um/users/{userId}/roles/{roleId}
   Authorization: Bearer <admin_token>
   ```
4. Check user doesn't already have role:
   ```bash
   GET /api/um/users/{userId}
   # Check roles array in response
   ```

---

### Middleware & Authorization

#### ❌ "403 Forbidden - Permission denied"
**Cause:** User doesn't have required role/permission
**Solution:**
1. Check required role for endpoint (see QUICKSTART.md)
2. Verify user has role:
   ```bash
   GET /api/um/users/{userId}
   Authorization: Bearer <admin_token>
   # Check "roles" array in response
   ```
3. Assign role if missing:
   ```bash
   POST /api/um/users/{userId}/roles/{roleId}
   Authorization: Bearer <admin_token>
   ```

#### ❌ "auditMiddleware not recording actions"
**Cause:** Middleware not properly attached
**Solution:**
1. Verify in app.js:
   ```javascript
   // WRONG:
   app.use(userManagementRoutes);
   
   // CORRECT:
   app.use(auditMiddleware);  // Add BEFORE routes
   app.use('/api/um', userManagementRoutes);
   ```
2. Audit logs only created for non-GET requests
3. Check audit logs:
   ```bash
   GET /api/um/audit-logs
   Authorization: Bearer <admin_token>
   ```

#### ❌ "Rate limiting blocking all login attempts"
**Cause:** Too many failed attempts from same IP
**Solution:**
1. Wait 15 minutes (auto resets)
2. Try from different IP/network
3. Configure rate limiting in `middleware/auth.js`:
   ```javascript
   // Change threshold from 5 attempts to 10:
   if (loginAttempts >= 10) {
   
   // Change lockout window from 15min to 30min:
   lockoutUntil: Date.now() + 30 * 60 * 1000
   ```

---

### Refresh Tokens & Sessions

#### ❌ "Refresh token endpoint returns 401"
**Cause:** Refresh token expired or revoked
**Solution:**
1. Login again to get new tokens:
   ```bash
   POST /api/um/auth/login
   {
     "emailOrUsername": "user@example.com",
     "password": "SecurePass123"
   }
   ```
2. Use new refresh token within 7 days
3. Refresh tokens stored in database for revocation

#### ❌ "Cannot find refresh token in cookie"
**Cause:** Cookie not being sent with request
**Solution:**
1. Verify cookie-parser middleware in app.js:
   ```javascript
   const cookieParser = require('cookie-parser');
   app.use(cookieParser());
   ```
2. Use with credentials in Postman:
   - Click "Settings" (gear icon)
   - Enable "Automatically follow redirects"
   - Cookie sharing is ON
3. In curl, use `-b` flag:
   ```bash
   curl -b "refreshToken=value" http://localhost:3000/api/um/auth/refresh-token
   ```

---

### Performance & Debugging

#### ❌ "Endpoints responding slowly (>1 second)"
**Cause:** Multiple possible reasons
**Solution:**
1. Check database connection:
   ```sql
   SHOW PROCESSLIST;  -- See active queries
   ```
2. Enable query logging:
   ```sql
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 1;  -- Log queries > 1 second
   ```
3. Verify indexes exist:
   ```sql
   SHOW INDEXES FROM users;
   ```
4. Add missing indexes if needed:
   ```sql
   CREATE INDEX idx_user_email ON users(email);
   ```

#### ❌ "Memory leak - memory keeps growing"
**Cause:** Connections not closed properly
**Solution:**
1. Check Sequelize connection pool:
   ```javascript
   // In models/index.js:
   sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
     host: process.env.DB_HOST,
     dialect: 'mysql',
     pool: {
       max: 5,      // Reduce if too high
       min: 0,
       acquire: 30000,
       idle: 10000
     }
   });
   ```
2. Clear connections on exit:
   ```javascript
   process.on('SIGINT', async () => {
     await sequelize.close();
     process.exit(0);
   });
   ```

#### ❌ "404 errors for UserManagement endpoints"
**Cause:** Routes not registered
**Solution:**
1. Verify in app.js:
   ```javascript
   const userManagementRoutes = require('./UserManagement/routes/userManagementRoutes');
   app.use('/api/um', userManagementRoutes);
   ```
2. Test route:
   ```bash
   curl http://localhost:3000/api/um/auth/login
   # Should NOT return 404
   ```
3. Check route file exists:
   ```bash
   ls -la UserManagement/routes/userManagementRoutes.js
   ```

#### ❌ "Cannot read logs - too many entries"
**Cause:** Unlimited audit logging
**Solution:**
1. Query with filters:
   ```bash
   GET /api/um/audit-logs?limit=20&offset=0
   GET /api/um/audit-logs?userId={id}
   GET /api/um/audit-logs?module=users
   ```
2. Archive old logs (recommended):
   ```sql
   -- Backup logs older than 90 days
   INSERT INTO audit_logs_archive 
   SELECT * FROM audit_logs WHERE createdAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
   
   -- Delete archived logs
   DELETE FROM audit_logs WHERE createdAt < DATE_SUB(NOW(), INTERVAL 90 DAY);
   ```

---

### Error Responses

#### Understanding Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request format, missing fields |
| 401 | Unauthorized | Token missing/invalid, login needed |
| 403 | Forbidden | User lacks required permission/role |
| 404 | Not Found | Resource doesn't exist, check IDs |
| 409 | Conflict | Duplicate entry, email/username taken |
| 422 | Unprocessable | Validation failed, check field values |
| 500 | Server Error | Bug in code, check server logs |

---

## FAQ

### Q: Can I use UserManagement without JWT?
**A:** Not recommended. JWT is essential for security. But you can:
- Keep JWT enabled for browser clients
- Use API keys for service-to-service communication
- Implement both authentication methods

### Q: How do I backup my user data?
**A:** Use MySQL backup:
```bash
mysqldump -u root -p oaems > backup_$(date +%Y%m%d).sql

# To restore:
mysql -u root -p oaems < backup_20250224.sql
```

### Q: Can I modify the audit log fields?
**A:** Yes, in `models/AuditLog.js`:
```javascript
// Add custom fields
customField: DataTypes.STRING,
```

Then update migrations and add migration file.

### Q: How do I export user list to CSV?
**A:** In controller, after `listUsers()`:
```javascript
const csv = require('csv-stringify');
csv.stringify(users, (err, output) => {
  res.attachment('users.csv');
  res.send(output);
});
```

Install: `npm install csv-stringify`

### Q: Can users change their own password?
**A:**  Yes! Use:
```bash
POST /api/um/auth/change-password
Authorization: Bearer <user_token>
{
  "oldPassword": "current_password",
  "newPassword": "NewSecurePass123"
}
```

### Q: How do I reset a user's password as admin?
**A:** Use:
```bash
POST /api/um/users/{userId}/reset-password
Authorization: Bearer <admin_token>
{
  "newPassword": "TemporaryPass123"
}
```

User must change on first login!

### Q: Can I customize role names?
**A:** Yes, roles are fully customizable. Create custom roles:
```bash
POST /api/um/roles
Authorization: Bearer <admin_token>
{
  "code": "CUSTOM_ROLE",
  "name": "My Custom Role",
  "description": "Custom role description"
}
```

### Q: How do I set user expiration dates?
**A:** Not built-in, but you can add:
1. Add `expiresAt` field to User model
2. Check in authMiddleware:
   ```javascript
   if (user.expiresAt < new Date()) {
     return res.status(401).json({ message: 'Account expired' });
   }
   ```

### Q: Can I sync UserManagement with LDAP/Active Directory?
**A:** Yes, as a separate sync service:
1. Fetch users from LDAP
2. Create/update in MongoDB using UserService
3. Run as cron job

### Q: How do I implement single sign-on (SSO)?
**A:** Add OAuth2/OIDC provider:
1. Install `passport-oauth2`
2. Create OAuth strategy
3. Use with UserService for user creation
4. Generate JWT after OAuth success

### Q: Is UserManagement production ready?
**A:** Yes! It includes:
- ✅ Security best practices
- ✅ Error handling
- ✅ Input validation
- ✅ Audit logging
- ✅ Rate limiting
- ✅ Account locking
- ✅ Proper database design

But always test thoroughly before production!

### Q: How do I monitor user activity?
**A:** Check audit logs:
```bash
GET /api/um/audit-logs
Authorization: Bearer <admin_token>

# Filter by user:
GET /api/um/audit-logs?userId={id}

# Filter by action:
GET /api/um/audit-logs?module=users
```

Or create dashboard querying audit_logs table.

---

## Getting Help

1. **Check QUICKSTART.md** for usage examples
2. **Check README.md** for API documentation
3. **Check code comments** for implementation details
4. **Check this guide** for common issues
5. **Review error messages** carefully
6. **Check console logs** for stack traces

---

## Reporting Issues

If you find a bug:
1. Document exact steps to reproduce
2. Include error message/stack trace
3. Include Node.js version: `node --version`
4. Include Express version: `npm list express`
5. Include database version: `mysql --version`

---

### Still Stuck?

1. Restart application: `npm start` (fresh start often helps)
2. Check network: Ensure database accessible
3. Review error message carefully
4. Search error message online
5. Check application logs for clues
6. Verify all dependencies installed: `npm install`

Remember: Most issues are configuration-related, not code bugs!

---

**Last Updated:** 2025-02-24
**Support:** See README.md for contact information
