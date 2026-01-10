exports.expense = (req, res) => {
  if (!req.session || !req.session.token) {
    return res.redirect("/");
  }
  
  res.render("pages/Expense", {
    pageTitle: "Expenses",
    layout: "main",
  });
};