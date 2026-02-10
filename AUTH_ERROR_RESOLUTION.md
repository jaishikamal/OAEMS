# 🔧 Auth System - Error Resolution Guide

## Common Issues & Solutions

---

## ❌ Error #1: "TypeError: Cannot read properties of undefined (reading 'token')"

### Location
`Auth.js` at line 24 in `postLogin` function

### Root Cause
The previous code tried to access `response.data.data.token` but:
1. The response structure might be different
2. The API call failed before getting a response
3. External API was not correctly configured

### Error Message
```
Login error: TypeError: Cannot read properties of undefined (reading 'token')
    at exports.postLogin (C:\Users\Kamal\Desktop\OAEMS\Controllers\Auth.js:24:44)
```

### ✅ FIXED IN NEW VERSION
The updated `Auth.js` now:
- Uses local database authentication (not external APIs)
- Validates response before accessing properties
- Generates JWT tokens locally
- Handles errors gracefully

### New Code Flow
```javascript
// OLD (Broken)
const response = await axios.post("https://external-api.com/login", ...);
req.session.token = response.data.data.token;  // Can fail here!

// NEW (Fixed)
const user = await User.findOne({ where: { email } });
if (!user) throw new Error("Invalid credentials");
const token = jwt.sign({ id: user.id, ... }, JWT_SECRET);
req.session.token = token;  // Safe!
```

---

## ❌ Error #2: "No session or token, redirecting to login"

### Root Cause
Browser doesn't have authentication session/token

### Scenarios Where This Happens
1. **First visit** - User hasn't logged in yet → Expected behavior
2. **Session expired** - Older session data deleted after 24 hours
3. **Cookie cleared** - User cleared browser cache/cookies
4. **Wrong page** - Trying to access protected page without auth
5. **Session not saved** - Session middleware not configured

### ✅ How to Check If User is Logged In

#### In Browser
```javascript
// Open DevTools Console
console.log(sessionStorage);  // Check for session data
console.log(document.cookie);  // Check for auth cookies
```

#### In App
```javascript
// Check if user is authenticated
if (req.session?.user && req.session?.token) {
  console.log("User is authenticated");
} else {
  console.log("User is NOT authenticated - redirect to login");
}
```

### ✅ Solutions

**1. User Not Logged In Yet**
→ Redirect to `/auth/login`
```javascript
if (!req.session?.token) {
  return res.redirect('/auth/login');
}
```

**2. Session Expired**
→ Use refresh token to get new access token
```javascript
// In authMiddleware
catch(error) {
  if (error.message.includes('expired')) {
    // Try to refresh token
    const newToken = await refreshAccessToken(req.session.user);
    req.session.token = newToken;
  } else {
    res.redirect('/auth/login');
  }
}
```

**3. Session Not Persisting**
→ Verify session middleware config in `app.js`
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));
```

**4. Cookie Not Saved**
→ Explicitly save session:
```javascript
req.session.save((err) => {
  if (err) console.error("Session save failed:", err);
  else console.log("Session saved successfully");
  res.redirect("/dashboard");
});
```

---

## ❌ Error #3: "Cannot find module 'bcryptjs'"

### Root Cause
Package not installed

### ✅ Solution
```bash
npm install bcryptjs

# Verify installation
npm list bcryptjs
```

---

## ❌ Error #4: "Cannot find module 'jsonwebtoken'"

### Root Cause
JWT package not installed

### ✅ Solution
```bash
npm install jsonwebtoken

# Verify
npm list jsonwebtoken
```

---

## ❌ Error #5: "User not found in database"

### Root Cause
- User doesn't exist
- Email/username mismatch
- Database not seeded with test users
- Wrong database connection

### ✅ Solutions

**1. Check Database Has Users**
```bash
# MySQL command line
USE oaems_db;
SELECT COUNT(*) FROM Users;

# Should return at least 1
```

**2. Verify Database Connection**
```javascript
// In app.js, add:
const db = require('./Models');
db.sequelize.sync()
  .then(() => console.log("✓ Database synced"))
  .catch(err => console.error("✗ Database error:", err));
```

**3. Create Test User**
```bash
# Run seeder
npx sequelize-cli db:seed --seed [seeder-name]

# Or create manually:
# INSERT INTO Users (id, firstName, lastName, email, username, password, status)
# VALUES (UUID(), 'Admin', 'User', 'admin@example.com', 'admin', HASH_PASSWORD('admin123'), 'active');
```

**4. Check Email Format**
- Ensure email is in database
- Email should be lowercase
- No spaces in email

---

## ❌ Error #6: "Password verification failed"

### Root Cause
- Wrong password entered
- Password not hashed in database
- Hash algorithm mismatch

### ✅ Solutions

**1. Verify Password Hashing**
```javascript
const bcrypt = require('bcryptjs');

// Create hash
const hashedPassword = await bcrypt.hash('mypassword', 10);

// Verify
const isValid = await bcrypt.compare('mypassword', hashedPassword);
console.log(isValid); // Should be true
```

**2. Check Database Password Format**
```bash
# Wrong - plain text password
SELECT password FROM Users LIMIT 1;
# Output: admin123

# Right - bcrypt hash (starts with $2a$ or $2b$)
SELECT password FROM Users LIMIT 1;
# Output: $2a$10$...
```

**3. Ensure Passwords Are Hashed When Creating User**
```javascript
// WRONG
const user = await User.create({
  password: 'plaintext123'  // Don't do this!
});

// RIGHT
const hashedPassword = await bcrypt.hash('plaintext123', 10);
const user = await User.create({
  password: hashedPassword
});
```

---

## ❌ Error #7: "Cannot read properties of undefined (reading 'roles')"

### Root Cause
User object doesn't have `roles` association included

### ✅ Solution
Include roles in database query:
```javascript
// WRONG
const user = await User.findOne({ where: { email } });
// user.roles is undefined

// RIGHT
const user = await User.findOne({
  where: { email },
  include: [{ association: 'roles' }]
});
// user.roles is now available
```

---

## ❌ Error #8: "Session save error"

### Root Cause
- Session middleware not properly configured
- Memory/storage issues
- Middleware order wrong in app.js

### ✅ Solutions

**1. Verify Middleware Order**
```javascript
// CORRECT ORDER in app.js
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({...}));  // Session AFTER body parser
app.use(flash());

// Then define routes
```

**2. Add Error Handling**
```javascript
req.session.save((err) => {
  if (err) {
    console.error("Session save failed:", {
      message: err.message,
      code: err.code,
      full: err
    });
    return res.status(500).json({ 
      error: "Session error",
      details: err.message 
    });
  }
  res.redirect("/dashboard");
});
```

**3. Check Session Secret**
```javascript
// Make sure SESSION_SECRET is set
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  // ...
}));
```

---

## ❌ Error #9: "EISDIR: illegal operation on a directory"

### Root Cause
Trying to require a directory instead of a file

### ✅ Solution
```javascript
// WRONG
const auth = require('./UserManagement/models');

// RIGHT - specify the file
const User = require('./UserManagement/models/User');
```

---

## ❌ Error #10: "Port already in use"

### Root Cause
Another process using the same port (default 3006)

### ✅ Solutions

**1. Kill Process Using Port**
```bash
# Windows
netstat -ano | findstr :3006
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :3006
kill -9 [PID]
```

**2. Use Different Port**
```bash
# Set in .env
PORT=3007

# Or run with different port
PORT=3007 npm start
```

---

## 🧪 Quick Diagnostic Commands

### Test if all packages installed
```bash
npm list --depth=0
```

### Test if database connected
```javascript
// Create test.js
const db = require('./Models');
db.sequelize.authenticate()
  .then(() => console.log("✓ DB connected"))
  .catch(err => console.log("✗ DB error:", err));
```

### Test if JWT works
```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 123 }, 'secret');
const decoded = jwt.verify(token, 'secret');
console.log(decoded);
```

### Test if Bcrypt works
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('test', 10)
  .then(hash => console.log("✓ Bcrypt hash:", hash))
  .catch(err => console.log("✗ Error:", err));
```

---

## 🔍 Debug Mode

Enable detailed logging by modifying `Auth.js`:

```javascript
// Add at top of functions
console.log('[DEBUG] Function called with:', {
  email: req.body.email,
  timestamp: new Date().toISOString()
});

// Add in middle
console.log('[DEBUG] User found:', {
  id: user?.id,
  email: user?.email,
  status: user?.status
});

// Add at end
console.log('[DEBUG] Login successful:', {
  userId: user.id,
  token: token?.substring(0, 20) + '...'
});
```

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] `.env` file exists with JWT_SECRET
- [ ] `npm install` completed successfully
- [ ] Database migrations run (`npx sequelize db:migrate`)
- [ ] Database seeded with test user (`npx sequelize db:seed:all`)
- [ ] Auth routes registered in `app.js`
- [ ] Login view exists at `views/auth/login.ejs`
- [ ] Session middleware configured in `app.js`
- [ ] No console errors on startup

---

## 🆘 If All Else Fails

### Complete Reset

```bash
# 1. Stop server
Ctrl + C

# 2. Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Reset database
npx sequelize db:migrate:undo:all
npx sequelize db:migrate
npx sequelize db:seed:all

# 4. Clear browser cache/cookies
# DevTools → Application → Clear all →  Reload

# 5. Restart server
npm start

# 6. Try login again
# http://localhost:3006/auth/login
```

### Manual Test

```bash
# Test login endpoint directly
curl -X POST http://localhost:3006/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@example.com&password=admin123"

# Should return HTML redirect or JSON response
```

---

## 📞 Support

If you still have issues:

1. Check the complete error message in console
2. Look at the Network tab in DevTools
3. Check database for data
4. Verify all dependencies installed
5. Check that migrations ran successfully
6. Review Auth.js flow line by line

---

**Status:** ✅ Complete Authentication System  
**Version:** 2.0
