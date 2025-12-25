exports.welcome = (req, res) => {
  res.render("pages/welcome", {
    pageTitle: "Welcome",
    layout: false,
  });
};

exports.dashboard = (req, res) => {
  res.render("pages/dashboard");
};
