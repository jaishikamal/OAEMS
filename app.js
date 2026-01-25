// modules required
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash"); // Add this package if using flash messages
const userRouter = require("./routes/userRouter");
const costRouter = require("./routes/CostRouter");
const AccountRouter = require("./routes/AccoutRouter");
const ExpensesHead = require("./routes/Expenses_head");
const chartofAccount = require("./routes/COARouter");
const ExpensesGovernance = require("./routes/Expenses_Governance");
const venderRouter = require("./routes/venderRouter");
const vendorTaxDetailRoutes = require("./routes/vendor_taxRouter");
const session = require("express-session");

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

// Routes
app.use("/", userRouter);
app.use("/", costRouter);
app.use("/", AccountRouter);
app.use("/", ExpensesHead);
app.use("/", chartofAccount);
app.use("/", ExpensesGovernance);
app.use("/", venderRouter);
app.use("/vendor-tax-details", vendorTaxDetailRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    error: "404 - Page Not Found",
    message: "The page you are looking for does not exist.",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).render("error", {
    title: "Error",
    error: err.message || "Internal Server Error",
    message: err.stack || "",
  });
});

// Define the PORT
const PORT = process.env.PORT || 3005;

// Export for Vercel
module.exports = app;

// Only start server locally (not on Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port :${PORT}`);
  });
}
