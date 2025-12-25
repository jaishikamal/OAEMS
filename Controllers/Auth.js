const axios = require("axios");

// Render login page (GET request)
exports.login = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login",
    layout: false, // optional: disable main layout
    errorMessage: null,
  });
};

// Handle login form submission (POST request)
exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Server-side API call to external login API
    const response = await axios.post(
      "https://oprsk.bizengineconsulting.com/api/auth/login",
      { email, password }
     
    );

    // Send API response back to frontend
    res.render("pages/Dashboard", {
      pageTitle: "Dashboard",
      layout: "main",
      // userData: response.data, // Pass user data to the dashboard view
    });
    // res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);

    // If credentials are invalid (e.g. 400/401 from API), show alert on login page
    const status = error.response?.status;
    if (status === 400 || status === 401) {
      return res.status(401).render("auth/login", {
        pageTitle: "Login",
        layout: false,
        errorMessage: "Invalid credentials.",
      });
    }

    // For other errors, return generic failure
    res.status(status || 500).render("auth/login", {
      pageTitle: "Login",
      layout: false,
      errorMessage: "Login failed. Please try again later.",
    });
  }
};
