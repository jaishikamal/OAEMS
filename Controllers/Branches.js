exports.branches = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Branches", {
    pageTitle: "Branches",
    layout: "main",
  });
};