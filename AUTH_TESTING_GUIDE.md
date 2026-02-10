# 🔐 Authentication System - Complete Testing Guide

## Overview
Your authentication system is now fully implemented with comprehensive debug logging, test users, and admin-only user creation. This guide walks you through testing every feature.

---

## 📋 Prerequisites

### 1. Database is migrated
```bash
npx sequelize db:migrate
```

### 2. Test users are seeded
```bash
npx sequelize db:seed:all
```

Expected output:
```
✅ Admin user created successfully!
   📧 Email: admin@oaems.local
   🔐 Password: admin@123456
✅ Manager user created successfully!
   📧 Email: manager@oaems.local
   🔐 Password: manager@123456
✅ Auditor user created successfully!
   📧 Email: auditor@oaems.local
   🔐 Password: auditor@123456
```

### 3. Start the application
```bash
nodemon app.js
```

Expected output:
```
✓ Application running on port 3006
✓ Database connected
✓ Authentication routes registered
```

---

## 🧪 Test Scenarios

### Test 1: Successful Login - Admin User
**Purpose:** Verify login flow with valid credentials

**Steps:**
1. Navigate to: `http://localhost:3006/auth/login`
2. Enter credentials:
   - Email: `admin@oaems.local`
   - Password: `admin@123456`
3. Click Login

**Expected Console Output:**
```
📝 [LOGIN] POST /auth/login - Login attempt
   🌐 IP Address: ::1
🔍 [LOGIN] Querying database for user...
✅ [LOGIN] User found: Admin User
   📊 Status: active
   🔒 Locked: false
   ❌ Failed attempts: 0
🔐 [LOGIN] Verifying password...
   ✅ Password matches!
⚠️  Failed attempts reset: 0
🎫 [LOGIN] JWT token generated - Expires in 24h
   🔑 Token: eyJhbGc...
👥 Roles: Administrator
🏢 Branches: All Branches
💾 [LOGIN] Saving session...
   ✅ Session saved successfully
🎉 [LOGIN] User admin@oaems.local logged in successfully from ::1
```

**Expected UI Response:**
- ✅ Flash message: "Welcome Admin User! You are now logged in."
- Redirected to dashboard or home page

---

### Test 2: Failed Login - Wrong Password (Multiple Attempts)
**Purpose:** Verify failed attempt tracking and account lockout

**Steps:**
1. Navigate to: `http://localhost:3306/auth/login`
2. Enter:
   - Email: `admin@oaems.local`
   - Password: `wrongpassword`
3. Click Login
4. Repeat 5 times with wrong password

**Expected Console Output (Attempt 1):**
```
📝 [LOGIN] POST /auth/login - Login attempt
   🌐 IP Address: ::1
🔍 [LOGIN] Querying database for user...
✅ [LOGIN] User found: Admin User
🔐 [LOGIN] Verifying password...
   ❌ Password does NOT match!
   ⚠️  Failed attempts: 1/5
❌ [LOGIN] Login failed for admin@oaems.local - Wrong password
```

**Expected Console Output (Attempt 5 - Account Locked):**
```
📝 [LOGIN] POST /auth/login - Login attempt
   🌐 IP Address: ::1
🔍 [LOGIN] Querying database for user...
✅ [LOGIN] User found: Admin User
🔐 [LOGIN] Verifying password...
   ❌ Password does NOT match!
   ⚠️  Failed attempts: 5/5
🔒 🔒 🔒 ACCOUNT LOCKED 🔒 🔒 🔒
🔒 Account locked for 30 minutes (until 2026-02-10 14:35:00)
❌ [LOGIN] Account locked for user admin@oaems.local
```

**Expected UI Response (After 5 Attempts):**
- ❌ Flash message: "Too many failed attempts. Account locked for 30 minutes."
- Cannot login until 30-minute lockout expires

---

### Test 3: Locked Account - Wait Period
**Purpose:** Verify account lockout mechanism

**Steps:**
1. After account is locked (from Test 2)
2. Try to login with correct password: `admin@123456`

**Expected Console Output:**
```
📝 [LOGIN] POST /auth/login - Login attempt
   🌐 IP Address: ::1
🔍 [LOGIN] Querying database for user...
✅ [LOGIN] User found: Admin User
   📊 Status: active
   🔒 Locked: true
   ⏰ Lock Until: 2026-02-10 14:35:00
🔒 Account is locked. Time remaining: 29 minutes 45 seconds
❌ [LOGIN] Attempted login with locked account
```

**Expected UI Response:**
- ❌ Flash message: "Account is locked. Time remaining: 29 minutes 45 seconds"
- Cannot login

**To Immediately Disable Lockout for Testing:**
```javascript
// In database console:
UPDATE Users SET isLocked = false, lockUntil = NULL WHERE email = 'admin@oaems.local';
```

---

### Test 4: Successful Login - Manager User
**Purpose:** Verify different user roles can login

**Steps:**
1. Navigate to: `http://localhost:3006/auth/login`
2. Enter credentials:
   - Email: `manager@oaems.local`
   - Password: `manager@123456`
3. Click Login

**Expected Console Output (Different Role):**
```
✅ [LOGIN] User found: Manager User
   📊 Status: active
   🔒 Locked: false
   ❌ Failed attempts: 0
🔐 [LOGIN] Verifying password...
   ✅ Password matches!
👥 Roles: Branch Manager
🏢 Branches: Branch 001
🎉 [LOGIN] User manager@oaems.local logged in successfully from ::1
```

---

### Test 5: Successful Login - Auditor User
**Purpose:** Verify different user roles can login

**Steps:**
1. Navigate to: `http://localhost:3006/auth/login`
2. Enter credentials:
   - Email: `auditor@oaems.local`
   - Password: `auditor@123456`
3. Click Login

**Expected Console Output:**
```
✅ [LOGIN] User found: Auditor User
   📊 Status: active
   🔒 Locked: false
   ❌ Failed attempts: 0
🔐 [LOGIN] Verifying password...
   ✅ Password matches!
👥 Roles: Auditor
🏢 Branches: Head Office
🎉 [LOGIN] User auditor@oaems.local logged in successfully from ::1
```

---

### Test 6: Non-Existent User
**Purpose:** Verify error handling for invalid email

**Steps:**
1. Navigate to: `http://localhost:3006/auth/login`
2. Enter:
   - Email: `nonexistent@oaems.local`
   - Password: `anypassword`
3. Click Login

**Expected Console Output:**
```
📝 [LOGIN] POST /auth/login - Login attempt
   🌐 IP Address: ::1
🔍 [LOGIN] Querying database for user...
❌ [LOGIN] User not found: nonexistent@oaems.local
```

**Expected UI Response:**
- ❌ Flash message: "User not found"

---

### Test 7: Registration Endpoint Disabled
**Purpose:** Verify self-registration is disabled (admin-only)

**Steps:**
1. Navigate to: `http://localhost:3006/auth/register`

**Expected Console Output:**
```
📋 [REGISTER] GET /auth/register - Registration disabled (Admin only)
```

**Expected UI Response:**
- ❌ Flash message: "User registration is disabled. Contact your administrator."
- Redirected to login page

---

### Test 8: Logout
**Purpose:** Verify session cleanup on logout

**Steps:**
1. Login with admin user (Test 1)
2. Navigate to: `http://localhost:3006/auth/logout`

**Expected Console Output:**
```
👋 [LOGOUT] User logging out: admin@oaems.local
   ⏰ Last login: 2026-02-10 13:45:30
✅ [LOGOUT] Session destroyed successfully
✅ [LOGOUT] Cookies cleared
```

**Expected UI Response:**
- ✅ Flash message: "You have been logged out successfully."
- Redirected to login page
- Session cookies cleared

---

### Test 9: Session Persistence - Check Current User
**Purpose:** Verify session is maintained across requests

**Steps:**
1. Login with admin user (Test 1)
2. Open browser developer tools (F12)
3. Open Console tab
4. Run:
```javascript
// Check session data
fetch('/auth/me')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Expected Console Output:**
```javascript
{
  success: true,
  user: {
    id: 1,
    email: "admin@oaems.local",
    firstName: "Admin",
    lastName: "User",
    status: "active",
    roles: ["Administrator"],
    branches: ["All Branches"]
  }
}
```

---

### Test 10: Protected Routes - Verify Middleware
**Purpose:** Verify unauthorized users cannot access protected routes

**Steps:**
1. Open new incognito window (no session)
2. Try to access: `http://localhost:3006/dashboard`

**Expected Behavior:**
- Redirected to login page (if dashboard is protected)
- OR specific error message

---

## 📊 Console Log Legend

| Symbol | Meaning | Example |
|--------|---------|---------|
| 📝 | Login attempt initiated | `📝 [LOGIN] POST /auth/login` |
| 🌐 | IP address tracked | `🌐 IP Address: ::1` |
| 🔍 | Database query | `🔍 [LOGIN] Querying database...` |
| ✅ | Success/verified | `✅ Password matches!` |
| ❌ | Failure/error | `❌ Password does NOT match!` |
| 🔐 | Security operation | `🔐 [LOGIN] Verifying password...` |
| ⚠️ | Warning/counting | `⚠️ Failed attempts: 1/5` |
| 🔒 | Account locked | `🔒 Account locked for 30 minutes` |
| 🎫 | Token generated | `🎫 [LOGIN] JWT token generated` |
| 👥 | User roles | `👥 Roles: Administrator` |
| 🏢 | User branches | `🏢 Branches: All Branches` |
| 💾 | Session saved | `💾 [LOGIN] Saving session...` |
| 🎉 | Success completion | `🎉 [LOGIN] User logged in successfully` |
| 👋 | Logout | `👋 [LOGOUT] User logging out` |
| ⏰ | Time/timestamp | `⏰ Last login: 2026-02-10` |

---

## 🔧 Quick Debugging Tips

### 1. View All Console Logs
Keep browser console open while testing:
- Press `F12` → Click "Console" tab
- Set filter to "clear on navigation" ☑️ OFF
- All logs will remain visible

### 2. Check Database Records
```bash
# Open MySQL console
mysql -u root -p

# Use OAEMS database
USE oaems_db;

# Check user table
SELECT id, email, firstName, status, isLocked, failedLoginAttempts FROM Users;

# Reset failed attempts
UPDATE Users SET failedLoginAttempts = 0, isLocked = false WHERE email = 'admin@oaems.local';
```

### 3. Reset Lockout Immediately (for Testing)
```javascript
// In browser console:
fetch('/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@oaems.local',
    password: 'admin@123456'
  })
}).then(r => r.text()).then(console.log);
```

### 4. View .env Configuration
```bash
cat .env
```

### 5. Check Express Session Storage
Sessions are stored in database by default. To view:
```sql
SELECT * FROM Sessions LIMIT 10;
```

---

## ✅ Complete Testing Checklist

- [ ] Test 1: Successful Admin Login
- [ ] Test 2: Failed Login Attempts (1-4)
- [ ] Test 3: Account Locked (5th attempt)
- [ ] Test 4: Locked Account Cannot Login
- [ ] Test 5: Manager User Login
- [ ] Test 6: Auditor User Login
- [ ] Test 7: Non-Existent User
- [ ] Test 8: Registration Disabled
- [ ] Test 9: Logout
- [ ] Test 10: Session Persistence
- [ ] Test 11: Protected Routes
- [ ] Verify all console logs have correct emoji indicators
- [ ] Verify all flash messages are user-friendly
- [ ] Verify IP addresses are logged
- [ ] Verify failed attempt counter works
- [ ] Verify account lockout is enforced

---

## 🚨 Troubleshooting

### Issue: "User not found" for seeded users
**Solution:** Ensure seeders ran successfully
```bash
npx sequelize db:seed:all
```

### Issue: "JWT_SECRET undefined" error
**Solution:** Check .env file exists in project root
```bash
cat .env | grep JWT_SECRET
```

### Issue: Sessions not persisting
**Solution:** Verify express-session is configured in app.js
```bash
grep -n "express-session" app.js
```

### Issue: Console logs not appearing
**Solution:** Ensure nodemon is watching Controllers/Auth.js
```bash
# Restart with explicit watch
nodemon app.js -- --inspect
```

### Issue: Account lockout not working
**Solution:** Verify database has `isLocked` and `lockUntil` columns
```sql
DESCRIBE Users;
```

---

## 📚 File References

- **Auth Controller:** [Controllers/Auth.js](Controllers/Auth.js)
- **Auth Router:** [routes/authRouter.js](routes/authRouter.js)
- **Test Seeder:** [UserManagement/seeders/20260210-create-test-users.js](UserManagement/seeders/20260210-create-test-users.js)
- **Configuration:** [.env](.env)
- **Middleware:** [Middlewares/authMiddleware.js](Middlewares/authMiddleware.js)

---

## 🎯 Next Steps After Testing

1. **Customize Login Template** - Update [views/auth/login.ejs](views/auth/login.ejs)
2. **Add Dashboard** - Create protected dashboard route
3. **Implement User Management** - Allow admins to create users
4. **Add Email Verification** - Send confirmation emails
5. **Implement 2FA** - Add two-factor authentication
6. **Add CSRF Protection** - Secure forms with CSRF tokens
7. **Rate Limiting** - Limit login attempts globally
8. **Audit Logging** - Log all authentication events

---

**Happy Testing! 🎉**
