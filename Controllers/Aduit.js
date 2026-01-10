exports.aduit = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Audit_Trail", {
    pageTitle: "Audit Trail",
    layout: "main",
  });
};