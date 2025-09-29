async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=staging"
    );
    const data = await response.json();
    console.log("Response:", data);
    if (response.ok && data.url) {
      console.log("Base URL:", data.url);
      return data.url;
    } else {
      throw new Error("Invalid response for base URL");
    }
  } catch (error) {
    console.error("Error fetching base URL:", error);
    throw error;
  }
}
async function APILoginUser() {
  const phone = document.getElementById("account").value;
  const password = document.getElementById("password").value;
  try {
    const BaseUrl = await fetchBaseURL();

    // Fix: Use regular fetch() with the BaseUrl string
    const res = await fetch(`${BaseUrl}/api/login_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        password,
      }),
    });

    const data = await res.json();
    if (res?.status === 200) {
      if (data.message === "LOGIN_SUCCESS") {
        localStorage.setItem("token", data.token);
        document.getElementById("modal-main").style("display", "none");
        var loginBox = document.getElementById("login-box");
        loginBox.innerHTML = `
    <div class="profile" style="display: block;">
      <span>User Name:${user?.user_name} </span> &nbsp;
      <span>User Id: ${user?.user_id}</span>
    </div>
  `;
        return data;
      } else if (data.message === "REQUIRE_RESET_PASSWORD") {
        return data;
      } else {
        return data;
      }
    } else {
      // Handle non-200 status codes
      return data;
    }
  } catch (e) {
    console.error("Login error:", e);

    // Note: fetch() doesn't automatically throw for HTTP error status codes
    // You might need to adjust this error handling based on your actual API response format
    if (e.response?.data?.message === "PASSWORD_INCORRECT") {
      return e.response?.data.message;
    } else if (e.response?.data?.message === "PLAYER_NOT_ALLOWED_LOGIN") {
      return e.response?.data.message;
    } else if (e.response?.data?.message === "TOO_MANY_ATTEMPTS") {
      return e.response?.data.message;
    } else if (e.response?.data?.message === "REQUIRE_RESET_PASSWORD") {
      return e.response?.data.message;
    } else if (e.response?.data?.message === "CAPTCHA_FAILED") {
      return e.response?.data.message;
    } else if (e.response?.data?.message === "The given data was invalid.") {
      return e.response?.data;
    } else if (e?.response?.status === 422) {
      return null;
    }

    // Return a generic error for unexpected cases
    return { error: "Network or unexpected error occurred" };
  }
}
async function handleSignUp() {
  const phone = document.getElementById("phoneNumber")?.value;
  const password = document.getElementById("inputPassword")?.value;

  // Validate inputs
  if (!phone || !password) {
    alert("Please enter both phone number and password");
    return null;
  }

  try {
    const BaseUrl = await fetchBaseURL();
    const res = await fetch(`${BaseUrl}/api/register_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        password,
        // agent_id: agentId
      }),
    });

    // Fix: Parse the JSON response first
    const data = await res.json();
    alert("Response: " + showErrors(JSON.stringify(data)));

    // Fix: Check the parsed data, not res.data
    if (data && data.status === true) {
      localStorage.setItem("token", data.token);
      return data.token;
    } else if (res.status === 200 && data.token) {
      localStorage.setItem("token", data.token);
      return data.token;
    } else {
      console.log("Registration failed:", data);
      return data;
    }
  } catch (e) {
    console.error("Registration error:", e);
    alert("Error: " + e.message);
    return { error: e.message };
  }
}

async function APIUser() {
  const BaseUrl = await fetchBaseURL();
  try {
    const res = await fetch(`${BaseUrl}/api/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 200) {
      const data = await res.json(); // <-- get the actual JSON object
      console.log("User data:", data);
      localStorage.setItem("user", JSON.stringify(data));
      return res.data;
    }
  } catch (e) {
    return e;
  }
  return null;
}

document.addEventListener("DOMContentLoaded", async () => {
  APIUser()
//   .then((data) => {
//     if (localStorage.getItem("token")) {
//       const loginBox = document.getElementById("login-box");
//       loginBox.innerHTML = `
//           <div class="profile" style="display: block;">
//             <span>UserName: ${data.username}</span><br>
//             <span>UserId: ${data.id}</span>
//           </div>
//         `;
//     }
//   });
});
