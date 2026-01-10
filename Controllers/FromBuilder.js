exports.fromBuilder = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/fromBuilder", {
    pageTitle: "Form Builder",
    layout: "main",
  });
};