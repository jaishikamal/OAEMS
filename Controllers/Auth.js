const axios = require("axios");

// polyfill fetch for CommonJS
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Render login page (GET request)
exports.login = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    layout: false,
    errorMessage: null,
  });
};

// Handle login form submission (POST request)
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Call external login API
    const response = await axios.post(
      "https://oprsk.bizengineconsulting.com/api/auth/login",
      { email, password }
    );

    // Save token in session
    req.session.token = response.data.data.token;

    console.log("Login successful:", response.data);

    // Redirect to dashboard after login
    return res.redirect("/dashboard");

  } catch (error) {
    console.error(error.response?.data || error.message);

    const status = error.response?.status;
    let errorMessage = "Login failed. Please try again later.";

    if (status === 400 || status === 401) {
      errorMessage = "Invalid credentials.";
    }

    return res.status(status || 500).render("auth/login", {
      pageTitle: "Login",
      layout: false,
      errorMessage,
    });
  }
};

// Handle logout
exports.logout = async (req, res) => {
  try {
    const token = req.session.token;

    if (!token) {
      return res.redirect("/login");
    }

    // Call external logout API
    const response = await fetch(
      "https://oprsk.bizengineconsulting.com/api/auth/logout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const data = await  response.json();
    console.log("Logout API response:", data);

    // Clear session and redirect to login
    req.session.destroy(() => {
      return res.redirect("/");
    });

  } catch (error) {
    console.error("Logout error:", error);

    // Even if API fails, clear session
    req.session.destroy(() => {
      return res.redirect("/");
    });
  }
};
