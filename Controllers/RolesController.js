//BASE_URL
const BASE_URL = "https://oprsk.bizengineconsulting.com/api";

exports.getRoles = async (req, res) => {
  try {
    // Enable login check
    if (!req.session || !req.session.token) {
      console.log("No session or token, redirecting to login");
      return res.redirect("/");
    }

    const token = req.session.token;

    // Fetch roles from external API
    const getListresponse = await fetch(
      `${BASE_URL}/admin/roles per_page=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Check if the response is successful
    if (!getListresponse.ok) {
      throw new Error(`HTTP error! status: ${getListresponse.status}`);
    }

    const rolesData = await getListresponse.json();
    console.log("Roles Data:", rolesData);
    // render page with roles data
   return res.render("pages/roles", {
      title: "Roles",
      roles: rolesData,
    });
   
  } catch (error) {
    console.error("Error in getRoles:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};
