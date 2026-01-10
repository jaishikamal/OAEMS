exports.approval = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Approval", {
    pageTitle: "Approval",
    layout: "main",
  });
};