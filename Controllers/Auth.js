const axios = require("axios");

// NO fetch import needed - it's built-in in Node.js 18+

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
    
    console.log("Login successful, saving session...");
    
    // CRITICAL FOR VERCEL: Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).render("auth/login", {
          pageTitle: "Login",
          layout: false,
          errorMessage: "Session error. Please try again.",
        });
      }
      console.log("token session:", req.session.token);
      console.log("Session saved successfully");
      return res.redirect("/dashboard");
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).render("auth/login", {
      pageTitle: "Login",
      layout: false,
      errorMessage: error.response?.data?.message || "Login failed. Please try again.",
    });
  }
};

// Handle logout
exports.logout = async (req, res) => {
  try {
    const token = req.session?.token;

    if (!token) {
      return res.redirect("/");
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

    const data = await response.json();
    console.log("Logout API response:", data);

    // Clear session and redirect to login
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      return res.redirect("/");
    });

  } catch (error) {
    console.error("Logout error:", error);

    // Even if API fails, clear session
    req.session.destroy((err) => {
      if (err) console.error("Session destroy error:", err);
      return res.redirect("/");
    });
  }
};