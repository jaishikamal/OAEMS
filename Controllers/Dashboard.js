exports.dashboard = (req, res) => {
  // Check if user is logged in
  if (!req.session.token) {
    return res.redirect("/"); // login नभएको खण्डमा login page मा redirect
  }

  // Optional: fetch user info from session or API if needed
  const userName = req.session.userName || "User";

  // Render dashboard page
  res.render("pages/Dashboard", {
    pageTitle: "Dashboard",
    layout: "main",
    
  });
};
