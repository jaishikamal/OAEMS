exports.report = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Reports", {
    pageTitle: "Reports",
    layout: "main",
  });
};