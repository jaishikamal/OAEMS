exports.budget = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Budget_Control", {
    pageTitle: "Budget Control",
    layout: "main",
  });
};