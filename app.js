// modules required
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash"); // Add this package if using flash messages
const session = require("express-session");
const cookieParser = require("cookie-parser");

// Auth routes
const authRouter = require("./routes/authRouter");

// Existing routers
const userRouter = require("./routes/userRouter");
const costRouter = require("./routes/CostRouter");
const AccountRouter = require("./routes/AccoutRouter");
const ExpensesHead = require("./routes/Expenses_head");
const chartofAccount = require("./routes/COARouter");
const ExpensesGovernance = require("./routes/Expenses_Governance");
const venderRouter = require("./routes/venderRouter");
const vendorTaxDetailRoutes = require("./routes/vendor_taxRouter");
const paymentBankingRoutes = require("./routes/paymentBankingRouter");
const complianceRiskRoutes = require("./routes/ComplianceRouter");
const addressContactRoutes = require('./routes/AddresscontactRoutes');
const Attachment=require('./routes/attachments_routes');

// UserManagement routes
try {
  var userManagementRoutes = require("./UserManagement/routes/userManagementRoutes");
  var viewRoutes = require("./UserManagement/routes/viewRoutes");
} catch (error) {
  console.warn("UserManagement routes not available:", error.message);
}


// Initialize the app
const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Setup layouts
app.use(expressLayouts);
app.set("layout", "main");

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Cookie parser middleware
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// Flash messages middleware (required for vendorTaxDetailController)
// Install: npm install connect-flash
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.pageScripts = [];
  next();
});

// Import database models
const db = require("./Models");

// Routes
// ============================================

// AUTH ROUTES (First Priority)
app.use("/auth", authRouter);
console.log("✓ Auth routes registered: /auth/*");

// USER MANAGEMENT ROUTES
if (userManagementRoutes && db) {
  // Initialize with models
  const umRoutes = userManagementRoutes(db);
  app.use("/api/um", umRoutes);
  console.log("✓ UserManagement API routes registered: /api/um/*");
}

if (viewRoutes && db) {
  // Initialize with models
  const vRoutes = viewRoutes(db);
  app.use("/usermanagement", vRoutes);
  console.log("✓ UserManagement view routes registered: /usermanagement/*");
  
  // Convenience redirect from old route to new route
  app.get("/userManagement", (req, res) => {
    res.redirect("/usermanagement/users");
  });
  console.log("✓ UserManagement redirect registered: /userManagement → /usermanagement/users");
}

// LEGACY ROUTES
app.use("/", userRouter);
app.use("/", costRouter);
app.use("/", AccountRouter);
app.use("/", ExpensesHead);
app.use("/", chartofAccount);
app.use("/", ExpensesGovernance);
app.use("/", venderRouter);
app.use("/vendor-tax-details", vendorTaxDetailRoutes);
app.use("/", paymentBankingRoutes);
app.use("/", complianceRiskRoutes);
app.use('/', addressContactRoutes);
app.use('/', Attachment);
// 404 page
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    error: "404 - Page Not Found",
    message: "The page you are looking for does not exist.",
  });
});

// Define the PORT
const PORT = process.env.PORT || 3006;

// Export for Vercel
module.exports = app;

// Only start server locally (not on Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port :${PORT}`);
  });
}
