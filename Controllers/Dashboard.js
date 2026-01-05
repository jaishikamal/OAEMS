exports.dashboard = (req, res) => {
  // Check if user is logged in
  if (!req.session.token) {
    return res.redirect("/"); 
  }
  
  const userName = req.session.userName || "User";
  
  // FIXED: lowercase "dashboard" to match filename
  res.render("pages/dashboard", {
    pageTitle: "Dashboard",
    layout: "main",
  });
};