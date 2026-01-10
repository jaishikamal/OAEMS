exports.setting = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Setting", {
    pageTitle: "Settings",
    layout: "main",
  });
};