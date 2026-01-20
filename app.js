// modules required
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const userRouter = require("./routes/userRouter");
const costRouter = require("./routes/CostRouter");
const AccountRouter = require("./routes/AccoutRouter");
const ExpensesTableRouter = require("./routes/Expenses_table");
const ExpensesHead =require("./routes/Expenses_head");
const ExpensesGovernance = require("./routes/Expenses_Governance")
const session = require("express-session");

// Initialize the app
const app = express();

// Set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Setup layouts
app.use(expressLayouts);
app.set("layout", "main"); // This points to views/main.ejs
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to set pageScripts for each request
app.use((req, res, next) => {
  res.locals.pageScripts = [];
  next();
});
app.use("/", userRouter);
app.use("/", costRouter);
app.use("/", AccountRouter);
app.use("/", ExpensesTableRouter);
app.use("/", ExpensesHead);
app.use("/", ExpensesGovernance);

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
