async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=gavn138"
    );
    const data = await response.json();
    if (response.ok && data.url) {
      return data.url;
      //   return'https://bo-demo.gagavn138.com';
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
  if (!phone || !password) {
    console.error("Phone and password are required")
    return;
  }
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
        const modalLogin = $j("#modal-loginNew");
        if (modalLogin.length > 0) {
          PopupUtil.closeModal("#modal-loginNew");
        }
        const user = await APIUser();
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
    console.error("Phone and password are required")
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
      const data = await res.json();
      // Normalize possible response shapes
      let payload = data;
      if (data && data.data) payload = data.data;

      // user object may be payload.user or payload itself
      const user = payload.user || payload;

      // try common balance paths
      const balance =
        payload.balance ?? user.balance ?? user.wallet_balance ?? null;

      // store normalized user and balance
      try {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("balance", String(balance));
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
    // if (response.ok) {
    const data = await response.json();
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


const handlePlayNow = async (passedGameId, elementId) => {
  // Initialize loader
  const parentElement = document.getElementById(elementId)?.querySelector('.ul-gameIcon-box');
  let loader;
  if (parentElement) {
    parentElement.style.position = "relative";
    loader = document.createElement("div");
    loader.classList.add("loader");
    loader.style.position = "absolute";
    loader.style.top = "0";
    loader.style.left = "0";
    loader.style.width = "100%";
    loader.style.height = "100%";
    loader.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
    loader.style.display = "flex";
    loader.style.justifyContent = "center";
    loader.style.alignItems = "center";
    loader.style.zIndex = "10";
    loader.innerHTML = '<div class="spinner"></div>';
    parentElement.appendChild(loader); // Append loader immediately
  }

  try {
    // Get isSeamlessEnabled from localStorage user
    let isSeamlessEnabled = false;
    const userRaw = localStorage.getItem("user");
    if (userRaw && userRaw !== "undefined") {
      try {
        const user = JSON.parse(userRaw);
        isSeamlessEnabled = user?.seamless?.isTransfer || false;
      } catch (e) {
        console.error("Invalid JSON in localStorage 'user':", userRaw);
      }
    }

    // Trigger SeamlessWithdrawAPI early if enabled
    let seamlessWithdraw = null;
    if (isSeamlessEnabled) {
      seamlessWithdraw = await SeamlessWithdrawAPI();
      // Update user in localStorage if response contains user data
      if (seamlessWithdraw) {
        const updatedUserData = await APIUser();
        localStorage.setItem("user", JSON.stringify(updatedUserData));
        localStorage.setItem("balance", updatedUserData.balance);
      }
    }

    // Fetch user balance
    const userBalance = await APIUser();
    localStorage.setItem("user", JSON.stringify(userBalance));
    localStorage.setItem("balance", userBalance.balance);

    // Use seamless balance if available, else user balance
    const checkPoints = isSeamlessEnabled
      ? seamlessWithdraw?.balance || userBalance.balance
      : userBalance.balance;
    const points = Math.trunc(parseFloat(checkPoints));

    // Determine gameId
    if (!passedGameId) {
      alert("Game ID not found.");
      return;
    }
    const gameId = passedGameId;

    // Check if game is daga
    const isDaga = gameId === 21;

    // Calculate points ratio
    let pointsRatio;
    if (isDaga) {
      // For daga: 30 points = 1 unit
      pointsRatio = Math.trunc(points / 30) * 30;
    } else {
      // For other games: 1:1 ratio
      pointsRatio = points;
    }

    // Show modal and exit if insufficient balance for daga
    if (isDaga && pointsRatio === 0) {
      showLinksModal();
      alert("Insufficient balance to play the game.");
      return;
    }

    // Fetch base URL (needed for both daga and non-daga)
    const BaseUrl = await fetchBaseURL();
    if (!BaseUrl) {
      alert("Failed to fetch base URL");
      return;
    }

    // Handle daga game
    if (isDaga) {
      const token = localStorage.getItem("token");
      const dagaUrl = `${BaseUrl}/player/daga/deposit`;

      const res = await fetch(dagaUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: pointsRatio,
        }),
      });

      const data = await res.json();

      if (res.status === 200 || res.status === 201) {
        if (data.status === true) {
          // Update user in localStorage
          const updatedUserData = await APIUser();
          localStorage.setItem("user", JSON.stringify(updatedUserData));
          localStorage.setItem("balance", updatedUserData.balance);
          showLinksModal(); // Show modal for daga
          alert("Deposit successful"); // Replace with toast.success if available
        } else {
          console.warn("APIDagaDeposit failed:", data);
          alert(`Deposit failed: ${data.message || "Unknown error"}`); // Replace with toast.error if available
        }
      } else {
        console.error("Daga deposit API error:", res.status, data);
        alert(`Deposit error: ${data.message || "Failed to process deposit"}`);
      }
      return; // Exit after handling daga
    }

    // Handle non-daga games
    // Call game login API
    const token = localStorage.getItem("token");
    const fullUrl = `${BaseUrl}/api/player/game/login`;
    const res = await fetch(fullUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        game_id: gameId,
        amount: checkPoints,
      }),
    });
    const data = await res.json();

    // Update user in localStorage
    const userData = await APIUser();
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("balance", userData.balance);

    if (res.status === 200 || res.status === 201) {
      if (data.link || data.game_url) {
        // window.open(data.link || data.game_url, "_blank");
         window.location.href = data.link || data.game_url;
      } else {
        alert("Game URL not found in response");
      }
    } else {
      console.error("API returned error status:", res.status, data);
      alert(`Error: ${data.message || "Failed to login to game"}`);
    }
  } catch (e) {
    console.error("Game login error:", e);
    alert(`Failed to connect to game: ${e.message}`);
  } finally {
    // Remove loader
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  }
};

async function SeamlessWithdrawAPI() {
  const BaseUrl = await fetchBaseURL();
  try {
    const res = await fetch(`${BaseUrl}/api/player/points/withdraw/seamless`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        accept: "application/json",
      },
    });

    const data = await res.json();
    if (data) {
      return data;
    }
  } catch (e) {
    // eslint-disable-next-line
    if (e.response.data.message == "INSUFFICIENT_BALANCE") {
      return "INSUFFICIENT_BALANCE";
      // eslint-disable-next-line
    } else if (e.response.data.message == "BALANCE_NETWORK_ERROR") {
      return "BALANCE_NETWORK_ERROR";
      // eslint-disable-next-line
    } else if (e.response.data.message == "REGISTRATION_NETWORK_ERROR") {
      return "REGISTRATION_NETWORK_ERROR";
      // eslint-disable-next-line
    } else if (e.response.data.message == "LOGIN_NETWORK_ERROR") {
      return "LOGIN_NETWORK_ERROR";
      // eslint-disable-next-line
    } else if (e.response.data.message == "PENDING_TRANSACTION") {
      return e.response.data;
      // eslint-disable-next-line
    } else if (e.response.data.message == "PLEASE_DEPOSIT") {
      return "PLEASE_DEPOSIT";
      // eslint-disable-next-line
    } else if (e.response.data.message == "PENDING_DEPOSIT") {
      return e.response.data;
      // eslint-disable-next-line
    } else if (e.response.data.message == "DEPOSIT_NETWORK_ERROR") {
      return "DEPOSIT_NETWORK_ERROR";
    } else {
      return null;
    }
    // else if (e.response.data.message == 'ADMIN_FORBIDDEN') {
    //   return 'adminForbidden'
    // }
  }
  return null;
}
// Remove this line:
// var balanceRefetch = ""

async function balanceRefetch() {
  try {
    // Optionally call SeamlessWithdrawAPI if you want to trigger a withdraw before fetching balance
    await SeamlessWithdrawAPI();

    const userData = await APIUser();
    if (userData && userData.balance !== undefined) {

      localStorage.setItem("balance", String(userData.balance));
      const balanceSpan = document.getElementById("balance");
      if (balanceSpan) {
        balanceSpan.textContent = userData.balance;
      }
      return userData.balance;
    } else {
      console.warn("Could not fetch user balance");
      return null;
    }
  } catch (error) {
    console.error("Error in balanceRefetch:", error);
    throw error;
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  const balance = localStorage.getItem("balance");
  APIUser().then((data) => {
    if (localStorage.getItem("token")) {
      const loginBox = document.getElementById("userInfo");
      loginBox.style.display = "flex";
      loginBox.style.gap = "10px";
      loginBox.innerHTML = `

		<div id="userInfo" class="user-info-group">
			<span class="txt">${data.user_name}</span>
          <span class="txt user-ID">
            <a href="javascript:void(0);" class="btn-xs"
              onclick="
                const userId = '${data.user_id}';
                const tempInput = document.createElement('input'); 
                tempInput.value = userId; 
                document.body.appendChild(tempInput); 
                tempInput.select(); 
                tempInput.setSelectionRange(0, 99999); 
                document.execCommand('copy'); 
                document.body.removeChild(tempInput); 
                alert('Copied ID: ' + userId);
              ">
              ${data.user_id}
              <i class='icon-copy'></i>
            </a>
          </span>
		</div>
		<div id="navigationBtn" class="navigation-btn"></div>
				
          `;
    }
    if (localStorage.getItem("token")) {
      const loginBox = document.getElementById("navigationBtn");
      loginBox.style.background = "none";
      loginBox.innerHTML = `

			<div id="balanceWrapper" class="balance-group" onclick=" balanceRefetch()">
				
				<a class="currency-selector" id="currencyViewer">
					<img class="flag" src="https://img.bdimg.xyz/theme/images/src-common/FLAG-img/flag-vn-o.webp">
					<span class="txt">VND</span>
				</a>
				

				<div class="user-balance is-reserve-check" style="cursor:pointer !important; ">
					
					<span class="txt" id="balance">${data.balance}</span>
					
				</div>

			</div>

		</div>
		</div>
				
          `;
    }
  });
});
