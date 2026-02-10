/**
 * INTEGRATION FILE - How to integrate UserManagement with your main Express app
 * 
 * STEP 1: Update Models/index.js
 * =============================
 * 
 * Replace your Models/index.js load section with:
 */

// --- START OF REPLACEMENT SECTION ---
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes,
    );
    db[model.name] = model;
  });

// Load UserManagement models
try {
  const userManagementModelsPath = path.join(__dirname, "../UserManagement/models");
  fs.readdirSync(userManagementModelsPath)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 &&
        file !== "index.js" &&
        file.slice(-3) === ".js" &&
        file.indexOf(".test.js") === -1
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
  console.log("UserManagement models not found or error loading them:", error.message);
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
// --- END OF REPLACEMENT SECTION ---

/**
 * STEP 2: Update app.js
 * =====================
 * 
 * Add these imports near the top:
 */

// --- ADD THESE IMPORTS ---
const cookieParser = require("cookie-parser");
const createUserManagementRoutes = require("./UserManagement/routes/userManagementRoutes");
const { auditMiddleware, authMiddleware } = require("./UserManagement/middleware/auth");
// --- END IMPORTS ---

// --- ADD COOKIE PARSER MIDDLEWARE (after body-parser) ---
app.use(cookieParser());
// --- END MIDDLEWARE ---

// --- ADD USER MANAGEMENT ROUTES (after other route definitions) ---
// Get database models
const db = require("./Models");

// Create and use UserManagement routes
try {
  const umRoutes = createUserManagementRoutes(db);
  // Apply audit middleware
  app.use("/api/um", auditMiddleware(db), umRoutes);
  console.log("✅ User Management module loaded successfully");
} catch (error) {
  console.error("❌ Error loading User Management module:", error.message);
}
// --- END ROUTES ---

/**
 * STEP 3: Environment Variables
 * =============================
 * 
 * Add to your .env file:
 */

/*
# JWT Configuration
ACCESS_TOKEN_SECRET=your-change-this-to-secure-random-string-12345
REFRESH_TOKEN_SECRET=your-change-this-to-another-secure-random-string-12345
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
REFRESH_TOKEN_EXPIRY_DAYS=7

# Database Configuration (adjust as needed)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=oaems

# Node Environment
NODE_ENV=development
*/

/**
 * STEP 4: Install Dependencies
 * =============================
 * 
 * Run in terminal:
 */

/*
npm install bcryptjs jsonwebtoken joi cookie-parser
*/

/**
 * STEP 5: Create Database Migrations
 * ===================================
 * 
 * Create migration files using Sequelize CLI:
 */

/*
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
*/

/**
 * STEP 6: Seed Initial Data (Optional)
 * ====================================
 * 
 * Create seeders for initial roles and permissions:
 */

/*
npx sequelize-cli seed:create --name initial-roles-and-permissions
*/

/**
 * STEP 7: Run Migrations & Seeds
 * =============================
 * 
 * Execute in terminal:
 */

/*
npx sequelize-cli db:migrate
npx sequelize-cli db:seed
*/

/**
 * COMPLETE EXAMPLE app.js SETUP
 * ==============================
 */

/*
// ... other imports ...
const cookieParser = require("cookie-parser");
const createUserManagementRoutes = require("./UserManagement/routes/userManagementRoutes");
const { auditMiddleware } = require("./UserManagement/middleware/auth");

const app = express();

// ... existing middleware ...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ADD THIS

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// ... other routes ...

// USER MANAGEMENT ROUTES
const db = require("./Models");
try {
  const umRoutes = createUserManagementRoutes(db);
  app.use("/api/um", auditMiddleware(db), umRoutes);
  console.log("✅ User Management API routes loaded");
} catch (error) {
  console.error("❌ User Management API error:", error.message);
}

// USER MANAGEMENT VIEWS ROUTES (NEW - Add this section)
try {
  const viewRoutes = require("./UserManagement/routes/viewRoutes");
  app.use("/usermanagement", viewRoutes);
  console.log("✅ User Management view routes loaded");
} catch (error) {
  console.error("❌ User Management views error:", error.message);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

/**
 * TESTING THE SETUP
 * =================
 * 
 * 1. Start your application
 *    npm start
 * 
 * 2. Login (using Postman or curl):
 *    POST http://localhost:3000/api/um/auth/login
 *    Body: {
 *      "emailOrUsername": "admin@example.com",
 *      "password": "SecurePass123"
 *    }
 * 
 * 3. Use the returned accessToken for subsequent requests
 * 
 * 4. Create a user:
 *    POST http://localhost:3000/api/um/users
 *    Headers: Authorization: Bearer <token>
 *    Body: {
 *      "firstName": "John",
 *      "lastName": "Doe",
 *      "email": "john@example.com",
 *      "username": "johndoe",
 *      "password": "SecurePass123"
 *    }
 * 
 * FEATURES AVAILABLE AFTER INTEGRATION
 * =====================================
 * 
 * ✅ JWT Authentication
 * ✅ User Management
 * ✅ Role Management
 * ✅ Permission Management
 * ✅ Branch Management
 * ✅ Account Locking
 * ✅ Audit Logging
 * ✅ Password Security
 * ✅ Login Attempt Tracking
 * ✅ Multi-Role Support
 * ✅ Multi-Branch Support
 * ✅ Role-Based Access Control
 * ✅ Permission-Based Authorization
 */

module.exports = {
  instructions: "See comments in this file for integration steps",
};
