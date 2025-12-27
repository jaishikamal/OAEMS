const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const base_URL = "https://oprsk.bizengineconsulting.com";

exports.userManagement = async (req, res) => {
  try {
    // ---- login check ----
    if (!req.session || !req.session.token) {
      return res.redirect("/");
    }

    const token = req.session.token;

    // ---- call API ----
    const response = await fetch(`${base_URL}/api/admin/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await response.json();

    console.log("User data fetched:", data);

    // ---- unauth redirect ----
    if (response.status === 401) {
      return res.redirect("/");
    }

    // ---- render page ----
    return res.render("pages/User_Management", {
      pageTitle: "User Management",
      layout: "main",
      users: data.data.data || [], 
      errorMessage: null,
    });

  } catch (error) {
    console.error("User API Error:", error);

    return res.status(500).render("pages/User_Management", {
      pageTitle: "User Management",
      layout: "main",
      users: [],
      errorMessage: "API बाट user data ल्याउन समस्या आयो।",
    });
  }
};
