async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=gavn138"
    );
    const data = await response.json();
    console.log("Response:", data);
    if (response.ok && data.url) {
      console.log("Base URL:", data.url);
      // return data.url;
      return'https://bo-demo.gagavn138.com';

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
        // document.getElementById("modal-main").style.display = "none";
        const modalLogin = $j('#modal-loginNew');
      if (modalLogin.length > 0) {
        PopupUtil.closeModal('#modal-loginNew');
      }
       const user = await APIUser();
       console.log(user);
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
      const data = await res.json(); // parsed JSON from API
      console.log("User data:", data);

      // Normalize possible response shapes
      let payload = data;
      if (data && data.data) payload = data.data;

      // user object may be payload.user or payload itself
      const user = payload.user || payload;

      // try common balance paths
      const balance =
        (payload.balance ?? user.balance ?? user.wallet_balance ?? null);

      // store normalized user and balance
      try {
        localStorage.setItem("user", JSON.stringify(user));
        if (balance !== null && balance !== undefined) {
          localStorage.setItem("balance", String(balance));
        }
      } catch (e) {
        console.warn("Could not persist user/balance to localStorage:", e);
      }

      return user;

    }
  } catch (e) {
    return e;
  }
  return null;
}
async function getGameCategories() {
  const BaseUrl = await fetchBaseURL();
  if (!BaseUrl) {
    console.error("Base URL is not defined");
    return null;
  }

  try {
    const response = await fetch(`${BaseUrl}/api/player/game_categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        accept: "application/json",
      },
    });
    console.log("Response status:", response);
    // if (response.ok) {
    const data = await response.json();
    console.log("Game categories fetched successfully:", data);
    return data;
    // }
    if (response.status === 500) {
      return "NETWORK_ERROR";
    }
  } catch (e) {
    console.error("Error fetching game categories:", e);
    if (e.response && e.response.status === 500) {
      return "NETWORK_ERROR";
    }
  }
  return null;
}

const handlePlayNow = async (passedGameId) => {
  console.log("handlePlayNow called", { passedGameId });
  // const pointsRaw = document.getElementById("points")?.value;
  const userBlance = await APIUser()
  console.log('userBlance',userBlance);
  
    const points = Math.trunc(parseFloat(userBlance.balance));
  
  let id = null;
  // allow caller to pass a hardcoded id (e.g. onclick="handlePlayNow(21)")
  if (passedGameId !== undefined && passedGameId !== null) {
    id = passedGameId;
  }
  const idRaw = localStorage.getItem("id");
  if (idRaw !== null && idRaw !== undefined && idRaw !== "undefined") {
    try {
      id = JSON.parse(idRaw);
    } catch (e) {
      console.error("Invalid JSON in localStorage 'id':", idRaw);
      id = null;
    }
  } else if (localStorage.getItem("daga")) {
    id = localStorage.getItem("daga");
  }
  // fallback to daga or a default hardcoded game id
  const DEFAULT_GAME_ID = 21; // change this as needed
  if (!id) {
    id = localStorage.getItem("daga") || DEFAULT_GAME_ID;
  }
  if (!id) {
    alert("Game ID not found.");
    return;
  }
  if (!points) {
    alert("Please fill in both fields");
    // return;
  } else {
    const BaseUrl = await fetchBaseURL();
    if (BaseUrl) {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BaseUrl}/api/player/game/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ game_id: id, amount:points }),
        });
        // const data = await res.json();
        if (res.status === 200 || res.status === 201) {
          if (localStorage.getItem("daga")) {
            console.log("yes daga:", res);
            showLinksModal();
          }
          closePointsModal();
        }
      } catch (e) {
        console.log("Game login error:", e);
        points.value = null;
        closePointsModal();
        return null;
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  APIUser()
  const categories = await getGameCategories();
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
