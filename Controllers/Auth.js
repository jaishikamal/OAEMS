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
    
    const response = await axios.post(
      "https://oprsk.bizengineconsulting.com/api/auth/login",
      { email, password }
    );
    
    req.session.token = response.data.data.token;
    req.session.user = response.data.data.user;
    
    console.log("Login successful:", response.data);
    
    // THIS IS CRITICAL FOR VERCEL:
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).render("auth/login", {
          pageTitle: "Login",
          layout: false,
          errorMessage: "Session error. Please try again.",
        });
      }
      return res.redirect("/dashboard");
    });
    
  } catch (error) {
    // ... error handling
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
