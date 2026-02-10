# 🚀 QUICK START - Authentication System

## Setup (One-time)
```bash
# 1. Create database
npx sequelize db:migrate

# 2. Add test users
npx sequelize db:seed:all

# 3. Start server
nodemon app.js
```

## Test Users (Ready to Use)
| Email | Password | Role |
|-------|----------|------|
| `admin@oaems.local` | `admin@123456` | ADMIN |
| `manager@oaems.local` | `manager@123456` | BRANCH_MANAGER |
| `auditor@oaems.local` | `auditor@123456` | AUDITOR |

## Test Login Flow
1. Open: `http://localhost:3006/auth/login`
2. Enter email & password from table above
3. Observe console logs with emoji indicators
4. ✅ Flash message appears on success

## Console Log Indicators
- 📝 Login started
- 🌐 IP tracked
- ✅ Verified/Success
- ❌ Failed/Error
- 🔐 Security step
- ⚠️  Warning/Count (1/5)
- 🔒 Account locked
- 🎫 Token created
- 👥 User roles
- 🎉 Login complete

## Test Failed Login (Account Lockout)
1. Login with wrong password 5 times
2. 🔒 Account locked after 5th attempt
3. Wait 30 minutes OR reset:
```sql
UPDATE Users SET isLocked = false, failedLoginAttempts = 0 
WHERE email = 'admin@oaems.local';
```

## Registration is DISABLED
- Only admin can create users
- Self-registration redirects to login
- See `Controllers/Auth.js` line 1-20

## Available Routes
- `GET /auth/login` - Login page
- `POST /auth/login` - Login submit
- `GET /auth/logout` - Logout
- `GET /auth/register` - Disabled (redirects)
- `GET /auth/me` - Current user info (requires auth)

## Configuration
- **JWT Secret:** In `.env` → `JWT_SECRET`
- **Session Secret:** In `.env` → `SESSION_SECRET`
- **Port:** `3006`
- **Database:** `oaems_db`

## Key Features
✅ Local database authentication (no external APIs)
✅ JWT tokens (24-hour expiry)
✅ Bcryptjs password hashing (10 rounds)
✅ Account lockout (5 failed attempts = 30 min)
✅ Comprehensive debug logging with emojis
✅ Flash alert messages
✅ IP address tracking
✅ Role-based access control
✅ Admin-only user creation
✅ Session persistence

## Files
- 📄 [AUTH_TESTING_GUIDE.md](AUTH_TESTING_GUIDE.md) - Full testing guide
- 📄 [Controllers/Auth.js](Controllers/Auth.js) - Auth logic
- 📄 [routes/authRouter.js](routes/authRouter.js) - Routes definition
- 📄 [UserManagement/seeders/20260210-create-test-users.js](UserManagement/seeders/20260210-create-test-users.js) - Test data
- 📄 [.env](.env) - Configuration

## Troubleshooting
| Issue | Fix |
|-------|-----|
| "User not found" | Run `npx sequelize db:seed:all` |
| "JWT_SECRET undefined" | Check `.env` exists in root |
| Logs not showing | Check nodemon is running |
| Account locked | Reset: `UPDATE Users SET isLocked = 0...` |
| Sessions not working | Verify express-session in app.js |

---
**Everything is ready! Start with: `nodemon app.js`** 🎉
