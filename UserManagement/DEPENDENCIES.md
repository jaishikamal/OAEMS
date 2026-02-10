# 📦 Required Dependencies for User Management System

## NPM Installation Command

```bash
npm install bcryptjs jsonwebtoken joi cookie-parser
```

## Individual Dependencies

### 1. **bcryptjs**
- **Version:** ^2.4.3
- **Purpose:** Password hashing and verification
- **Command:** `npm install bcryptjs`

### 2. **jsonwebtoken**
- **Version:** ^9.0+
- **Purpose:** JWT token generation and verification
- **Command:** `npm install jsonwebtoken`

### 3. **joi**
- **Version:** ^17.9+
- **Purpose:** Schema validation for requests
- **Command:** `npm install joi`

### 4. **cookie-parser**
- **Version:** ^1.4.6+
- **Purpose:** Parse and handle HTTP cookies
- **Command:** `npm install cookie-parser`

## Already Installed Dependencies (Your Package.json)

These should already be in your project:
- express (^4.21.0)
- sequelize (^6.37.7)
- mysql2 (^3.16.0)
- express-session (^1.18.2)

## Complete package.json Update

Add these to your dependencies section:

```json
{
  "dependencies": {
    "express": "^4.21.0",
    "sequelize": "^6.37.7",
    "mysql2": "^3.16.0",
    "express-session": "^1.18.2",
    "body-parser": "^1.20.3",
    "ejs": "^3.1.10",
    "express-ejs-layouts": "^2.5.1",
    "connect-flash": "^0.1.1",
    "multer": "^2.0.2",
    "node-fetch": "^3.3.2",
    "axios": "^1.13.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "joi": "^17.9.2",
    "cookie-parser": "^1.4.6"
  }
}
```

## Installation Steps

1. **Navigate to project directory:**
   ```bash
   cd c:\Users\Kamal\Desktop\OAEMS
   ```

2. **Install dependencies:**
   ```bash
   npm install bcryptjs jsonwebtoken joi cookie-parser
   ```

3. **Verify installation:**
   ```bash
   npm list bcryptjs jsonwebtoken joi cookie-parser
   ```

Expected output:
```
├── bcryptjs@2.4.3
├── cookie-parser@1.4.6
├── joi@17.9.2
└── jsonwebtoken@9.0.0
```

## Optional Dependencies (Recommended)

For development and testing:

```bash
npm install --save-dev nodemon
```

## Verification Test

Create a test file `test-user-management.js`:

```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const cookieParser = require('cookie-parser');

console.log('✅ bcryptjs loaded:', typeof bcrypt.hash);
console.log('✅ jsonwebtoken loaded:', typeof jwt.sign);
console.log('✅ joi loaded:', typeof Joi.object);
console.log('✅ cookie-parser loaded:', typeof cookieParser);

console.log('\n✅ All dependencies loaded successfully!');
```

Run with: `node test-user-management.js`

## Troubleshooting

### Issue: "Cannot find module 'bcryptjs'"
**Solution:** 
```bash
npm install bcryptjs
```

### Issue: "JWT token errors"
**Solution:**
```bash
npm install jsonwebtoken --save
```

### Issue: "Joi validation not working"
**Solution:**
```bash
npm install joi@^17.9.2
```

### Issue: "Cookie not working"
**Solution:**
```bash
npm install cookie-parser
npm list cookie-parser
```

### Clean Install (if all else fails)
```bash
rm -rf node_modules package-lock.json
npm install
```

## Version Compatibility

| Package | Min Version | Recommended |
|---------|------------|-------------|
| bcryptjs | 2.4.0 | 2.4.3+ |
| jsonwebtoken | 8.5.0 | 9.0.0+ |
| joi | 17.0.0 | 17.9.2+ |
| cookie-parser | 1.4.5 | 1.4.6+ |
| express | 4.17.0 | 4.21.0+ |
| sequelize | 6.0.0 | 6.37.7+ |

## Post-Installation Setup

After installing dependencies:

### 1. Update app.js
Add cookie parser middleware:
```javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser());
```

### 2. Configure Environment Variables
Create/update .env file with JWT secrets

### 3. Test Dependencies
Run the verification test above

## Security Notes

⚠️ **Important Security Considerations:**

1. **Keep bcrypt salt rounds at 10** - Don't lower for performance
2. **Use strong JWT secrets** - Change from defaults
3. **Set NODE_ENV=production** in production
4. **Keep dependencies updated:**
   ```bash
   npm outdated
   npm update
   ```

## Update Existing Project

If upgrading from old setup:

```bash
npm update
npm install bcryptjs jsonwebtoken joi cookie-parser
```

## Support

For dependency issues:
- Check npm registry: `npm view bcryptjs`
- View installed versions: `npm list`
- Check for conflicts: `npm ls --all` 

All dependencies are stable and production-ready! 🚀
