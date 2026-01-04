// modules required
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const userRouter = require("./routes/userRouter");
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
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/", userRouter);

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
