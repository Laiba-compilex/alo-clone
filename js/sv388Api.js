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
  const logoutbutton = document.getElementById("logout-menuitem");
  if (!phone || !password) {
    console.error("Phone and password are required")
    return { error: "Phone and password are required" };
  }
  try {
    const BaseUrl = await fetchBaseURL();

    // Fix: Use regular fetch() with the BaseUrl string
    const res = await fetch(`${BaseUrl}/api/login_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });
    if (!res) return { error: "Authentication failed" };

    const data = await res.json();
    if (res?.status === 200) {
      if (data.message === "LOGIN_SUCCESS") {
        localStorage.setItem("token", data.token);
        logoutbutton.style.display = "block";
        window.location.reload();
        // document.getElementById("modal-main").style.display = "none";
        const modalLogin = $j("#modal-loginNew");
        if (modalLogin.length > 0) {
          PopupUtil.closeModal("#modal-loginNew");
        }
        const user = await APIUser();
        console.log("Logged in user:", user);
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
      if (data.message) alert(data.message);
      else if (data.errors) {
        const errorMsg = Object.values(data.errors).map(arr => arr[0]).join(", ");
        alert(errorMsg);
      }
      return data;
    }
  } catch (e) {
    console.error("Login error:", e);
    onsole.error("Login error:", e);

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

  if (!phone || !password) {
    alert("Please enter both phone number and password");
    console.error("Phone and password are required");
    return null;
  }

  try {
    const BaseUrl = await fetchBaseURL();
    const res = await fetch(`${BaseUrl}/api/register_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, password }),
    });
    if (!res) return { error: "Authentication failed" };

    // Fix: Parse the JSON response first
    const data = await res.json();
    if (data && data.status === true) {
      localStorage.setItem("token", data.token);
      return data.token;
    } else if (res.status === 200 && data.token) {
      localStorage.setItem("token", data.token);
      return data.token;
    } else {
      if (data.errors) {
        const errorMsg = Object.values(data.errors).map(arr => arr[0]).join(", ");
        alert(errorMsg);
      }
      else if (data.message) alert(data.message);
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
    if (!res) return null;

    if (res.status === 302) {
      localStorage.clear();
      window.location.href = "index.html";
      return null;
    }

    if (res.status === 200) {
      const data = await res.json();
      let payload = data;
      if (data && data.data) payload = data.data;
      const user = payload.user || payload;
      const balance = payload.balance ?? user.balance ?? user.wallet_balance ?? null;
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
    const response = await fetch(
      `${BaseUrl}/api/player/game_categories`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "application/json",
        },
      }
    );
    if (!response) return null;
    // if (response.ok) {

    // }
    if (response.status === 500) {
      return "NETWORK_ERROR";
    }
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("Error fetching game categories:", e);
    if (e.response && e.response.status === 500) {
      return "NETWORK_ERROR";
    }
  }
  return null;

}

const handlePlayNow = async (passedGameId, elementId) => {
  // Show full-screen loader
  const gameLoader = document.getElementById('gameLoader');
  if (gameLoader) {
    gameLoader.style.display = 'flex';
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
      // Hide loader before returning
      const gameLoader = document.getElementById('gameLoader');
      if (gameLoader) {
        gameLoader.style.display = 'none';
      }
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
      // Hide loader before returning
      const gameLoader = document.getElementById('gameLoader');
      if (gameLoader) {
        gameLoader.style.display = 'none';
      }
      return;
    }

    // Fetch base URL (needed for both daga and non-daga)
    const BaseUrl = await fetchBaseURL();
    if (!BaseUrl) {
      alert("Failed to fetch base URL");
      // Hide loader before returning
      const gameLoader = document.getElementById('gameLoader');
      if (gameLoader) {
        gameLoader.style.display = 'none';
      }
      return;
    }

    // Handle daga game
    if (isDaga) {
      const token = localStorage.getItem("token");
      const dagaUrl = `${BaseUrl}/api/player/daga/deposit`; // Updated URL

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
      if (!res) return;

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
    if (!res) return;
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
    // Hide full-screen loader
    const gameLoader = document.getElementById('gameLoader');
    if (gameLoader) {
      gameLoader.style.display = 'none';
    }
  }
};

async function SeamlessWithdrawAPI() {
  const BaseUrl = await fetchBaseURL();
  try {
    const res = await fetch(
      `${BaseUrl}/api/player/points/withdraw/seamless`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "application/json",
        },
      }
    );
    if (!res) return null;

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

// Function to show links modal for daga game
async function showLinksModal() {
  try {
    const response = await fetch('https://bo.gagavn138.com/api/website/links');
    const data = await response.json();

    let modal = document.getElementById('linksModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'linksModal';
      modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
      `;
      document.body.appendChild(modal);
    }

    let linksHtml = '';
    if (data.status && data.data) {
      data.data.forEach((link, index) => {
        linksHtml += `
          <a href="${link.value}" target="_blank" style="
            display: block;
            margin: 12px 0;
            padding: 15px 20px;
            background: rgba(255,255,255,0.15);
            color: white;
            text-decoration: none;
            border-radius: 15px;
            border: 2px solid rgba(255,255,255,0.2);
            font-weight: 500;
            transition: all 0.3s;
            backdrop-filter: blur(10px);
          " onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='translateY(0)'">🔗 Website Link ${index + 1}</a>
        `;
      });
    }

    modal.innerHTML = `
      <div style="
        background: linear-gradient(-180deg, #0c1117 0%, #162c3f 100%);
        margin: 10% auto;
        padding: 30px;
        border: none;
        width: 90%;
        max-width: 450px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        color: white;
      ">
        <span onclick="closeLinksModal()" style="
          color: rgba(255,255,255,0.8);
          float: right;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.3s;
        " onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">&times;</span>
        <h3 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">🎮 Daga Game Links</h3>
        <p style="margin: 0 0 25px 0; opacity: 0.9; font-size: 16px;">Choose your preferred access link:</p>
        <div style="margin: 0;">
          ${linksHtml}
          <button onclick="closeLinksModal()" style="
            padding: 12px 30px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">Close</button>
        </div>
      </div>
    `;

    modal.style.display = 'block';
  } catch (error) {
    console.error('Error fetching links:', error);
    // Fallback to show modal without API links
    let modal = document.getElementById('linksModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'linksModal';
      modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        margin: 10% auto;
        padding: 30px;
        border: none;
        width: 90%;
        max-width: 450px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        color: white;
      ">
        <span onclick="closeLinksModal()" style="
          color: rgba(255,255,255,0.8);
          float: right;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.3s;
        " onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.8)'">&times;</span>
        <h3 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">⚠️ Connection Error</h3>
        <p style="margin: 0 0 25px 0; opacity: 0.9; font-size: 16px;">Unable to load links. Please try again later.</p>
        <div style="margin: 0;">
          <button onclick="closeLinksModal()" style="
            padding: 12px 30px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
          " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">Close</button>
        </div>
      </div>
    `;

    modal.style.display = 'block';
  }
}

// Function to close links modal
function closeLinksModal() {
  const modal = document.getElementById('linksModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Fetch SV388 balance
async function fetchSV388Balance() {
  try {
    const response = await fetch('https://bo.gagavn138.com/api/player/daga/balance', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data.status ? data.result : null;
  } catch (error) {
    console.error('Error fetching SV388 balance:', error);
    return null;
  }
}

// Withdraw from SV388
async function withdrawFromSV388(amount) {
  try {
    const response = await fetch('https://bo.gagavn138.com/api/player/points/withdraw/daga', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });
    const data = await response.json();
    if (data.status) {
      // Update user data after successful withdrawal
      const userData = await APIUser();
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        const balanceSpan = document.getElementById('balance');
        if (balanceSpan) balanceSpan.textContent = userData.balance;
      }
    }
    return data;
  } catch (error) {
    console.error('Error withdrawing from SV388:', error);
    return null;
  }
}

// Show SV388 balance dropdown
async function showSV388Dropdown() {
  const balance = await fetchSV388Balance();
  const dropdown = document.getElementById('sv388Dropdown');

  if (balance !== null) {
    dropdown.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.1); border-radius: 8px; font-size:14px">
        <div>|</div> 
        <span> SV388: ${balance} VND</span>
          <button onclick="handleSV388Withdraw(${balance})" style="
            background: #28a745; color: white; border: none; padding: 4px 8px; 
            border-radius: 4px; cursor: pointer; font-size: 12px;
          ">Get Balance</button>
          <button onclick="refreshSV388Balance()" style="
            background: #17a2b8; color: white; border: none; padding: 4px; 
            border-radius: 4px; cursor: pointer; font-size: 12px;
          ">🔄</button>
      </div>
    `;
  } else {
    dropdown.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; background: rgba(220,53,69,0.1); border-radius: 8px; font-size:14px">
      <div>|</div>   
      <span>SV388: Error</span>
        <button onclick="refreshSV388Balance()" style="
          background: #dc3545; color: white; border: none; padding: 4px; 
          border-radius: 4px; cursor: pointer; font-size: 12px;
        ">🔄 Retry</button>
      </div>
    `;
  }
}

// Handle SV388 withdrawal
async function handleSV388Withdraw(amount) {
  const result = await withdrawFromSV388(amount);
  if (result && result.status) {
    alert('Points transferred successfully!');
    window.location.reload();
  } else {
    alert('Failed to transfer points. Please try again.');
  }
}

// Refresh SV388 balance
async function refreshSV388Balance() {
  showSV388Dropdown();
}

async function balanceRefetch() {
  try {
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
async function fetchSv388EventInfo() {
  try {
    const response = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.cpcvs388.com/homePage/player/getSv388EventInfo'));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching SV388 event info:', error);
    return null;
  }
}

function populateSv388Calendar(events) {
  if (!events || !Array.isArray(events)) return;

  // Group events by date
  const eventsByDate = {};
  events.forEach(event => {
    const dateKey = event.date.split(' ')[0]; // YYYY-MM-DD
    if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
    eventsByDate[dateKey].push(event);
  });

  // Get current week dates (Monday to Sunday)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  // Populate this week
  const firstWeekTitle = document.getElementById('firstWeekTitle');
  const thisWeekRow = document.querySelector('#thisWeek tbody.this-week tr:last-child');

  if (firstWeekTitle && thisWeekRow) {
    const ths = firstWeekTitle.querySelectorAll('th');
    const tds = thisWeekRow.querySelectorAll('td');

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayEvents = eventsByDate[dateStr] || [];

      // Update date header
      ths[i].textContent = currentDate.getDate();
      if (currentDate.toDateString() === today.toDateString()) {
        ths[i].classList.add('today');
        tds[i].classList.add('today');
      }

      // Update events
      tds[i].setAttribute('eventcount', dayEvents.length);
      tds[i].innerHTML = '';
      dayEvents.forEach(event => {
        const time = event.date.split(' ')[1].substring(0, 5);
        const dl = document.createElement('dl');
        const dt = document.createElement('dt');
        dt.textContent = event.arena;
        const dd = document.createElement('dd');
        dd.innerHTML = `${time} &nbsp;F${event.matchcount}`;
        dl.appendChild(dt);
        dl.appendChild(dd);
        tds[i].appendChild(dl);
      });
    }
  }

  // Populate future weeks
  const calendarContainer = document.getElementById('calendar_container');
  if (!calendarContainer) return;
  calendarContainer.innerHTML = '';

  const dates = Object.keys(eventsByDate).sort();
  const nextWeekStart = new Date(monday);
  nextWeekStart.setDate(monday.getDate() + 7);

  // Find the last date with events
  const lastEventDate = dates.length > 0 ? new Date(dates[dates.length - 1]) : nextWeekStart;

  // Generate complete weeks from nextWeekStart to lastEventDate
  let currentWeekStart = new Date(nextWeekStart);

  while (currentWeekStart <= lastEventDate) {
    const dateRow = document.createElement('tr');
    const eventRow = document.createElement('tr');

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayEvents = eventsByDate[dateStr] || [];

      // Create date header
      const th = document.createElement('th');
      th.setAttribute('day', currentDate.getDate());
      th.setAttribute('month', currentDate.getMonth() + 1);
      th.textContent = currentDate.getDate();
      if (currentDate.getDate() === 1) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        th.innerHTML = `${currentDate.getDate()}<span class="month-start">${months[currentDate.getMonth()]}</span>`;
      }
      dateRow.appendChild(th);

      // Create event cell
      const td = document.createElement('td');
      td.setAttribute('eventcount', dayEvents.length);
      td.setAttribute('day', currentDate.getDate());
      td.setAttribute('month', currentDate.getMonth() + 1);

      dayEvents.forEach(event => {
        const time = event.date.split(' ')[1].substring(0, 5);
        const dl = document.createElement('dl');
        const dt = document.createElement('dt');
        dt.textContent = event.arena;
        const dd = document.createElement('dd');
        dd.innerHTML = `${time} &nbsp;F${event.matchcount}`;
        dl.appendChild(dt);
        dl.appendChild(dd);
        td.appendChild(dl);
      });

      eventRow.appendChild(td);
    }

    calendarContainer.appendChild(dateRow);
    calendarContainer.appendChild(eventRow);

    // Move to next week
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Fetch and populate SV388 calendar
  const sv388Data = await fetchSv388EventInfo();
  if (sv388Data) {
    populateSv388Calendar(sv388Data);

    // Update calendar title with current month
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const titleEl = document.getElementById('todayTitle');
    if (titleEl) {
      titleEl.innerHTML = `${now.getFullYear()} <span>${months[now.getMonth()]}</span>&nbsp;<span>Cockfight Calendar</span>`;
    }
  }

  APIUser().then((data) => {
    // Check if user has SV388 transfer enabled
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const shouldShowSV388 = user.seamless?.isTransfer && user.seamless?.game_id === 21;
    if (localStorage.getItem("token")) {
      const loginBox = document.getElementById("userInfo");
      const loginBox1 = document.getElementById("userInfo1");
      loginBox1.classList.remove("justify-content-between");

      loginBox.style.display = "flex";
      loginBox.style.gap = "10px";
      loginBox1.style.display = "flex";
      loginBox1.style.gap = "10px";
      const fallback = JSON.parse(localStorage.getItem("user"));
      const fallbackName = fallback?.name;
      const fallbackId = fallback?.user_id;
      loginBox.innerHTML = `

		<div id="userInfo" class="user-info-group">
			<span class="txt">${data?.user_name || fallbackName}</span>
          <span class="txt user-ID">
            <a href="javascript:void(0);" class="btn-xs"
              onclick="
                const userId = '${data?.user_id || fallbackId}';
                const tempInput = document.createElement('input'); 
                tempInput.value = userId; 
                document.body.appendChild(tempInput); 
                tempInput.select(); 
                tempInput.setSelectionRange(0, 99999); 
                document.execCommand('copy'); 
                document.body.removeChild(tempInput); 
                alert('Copied ID: ' + userId);
              ">
              ${data?.user_id || fallbackId}
              <i class='icon-copy'></i>
            </a>
          </span>
		</div>
		<div id="navigationBtn" class="navigation-btn"></div>
				
          `;
      loginBox1.innerHTML = `

		<div id="userInfo" class="user-info-group">
			<span class="txt">${data?.user_name || fallbackName}</span>
          <span class="txt user-ID">
            <a href="javascript:void(0);" class="btn-xs"
              onclick="
                const userId = '${data?.user_id || fallbackId}';
                const tempInput = document.createElement('input'); 
                tempInput.value = userId; 
                document.body.appendChild(tempInput); 
                tempInput.select(); 
                tempInput.setSelectionRange(0, 99999); 
                document.execCommand('copy'); 
                document.body.removeChild(tempInput); 
                alert('Copied ID: ' + userId);
              ">
              ${data?.user_id || fallbackId}
              <i class='icon-copy'></i>
            </a>
          </span>
		</div>
		<div id="navigationBtn1" class="navigation-btn justify-content-start"  style="width: fit-content"></div>
				
          `;
    }
    if (localStorage.getItem("token")) {
      const loginBox = document.getElementById("navigationBtn");
      const loginBox1 = document.getElementById("navigationBtn1");
      loginBox.style.background = "none";
      const fallback = JSON.parse(localStorage.getItem("user"));
      const fallbackBalance = fallback?.balance;
      loginBox.innerHTML = `

			<div id="balanceWrapper" class="balance-group" onclick=" balanceRefetch()" style="width:max-content">
				
				<a class="currency-selector" id="currencyViewer">
					<img class="flag" src="https://img.bdimg.xyz/theme/images/src-common/FLAG-img/flag-vn-o.webp">
					<span class="txt">VND</span>
				</a>
				

				<div class="user-balance is-reserve-check" style="cursor:pointer !important; ">
					
					<span class="txt" id="balance">${data?.balance || fallbackBalance}</span>
					
				</div>
				
				${shouldShowSV388 ? '<div id="sv388Dropdown"></div>' : ''}

			</div>

		</div>
		</div>
				
          `;
      loginBox1.innerHTML = `

      	<div id="balanceWrapper" class="balance-group" onclick=" balanceRefetch()">

      		<a class="currency-selector" id="currencyViewer">
      			<img class="flag" src="https://img.bdimg.xyz/theme/images/src-common/FLAG-img/flag-vn-o.webp">
      			<span class="txt">VND</span>
      		</a>

      		<div class="user-balance is-reserve-check" style="cursor:pointer !important; ">

      			<span class="txt" id="balance">${data?.balance || fallbackBalance}</span>

      		</div>
      		
      		${shouldShowSV388 ? '<div id="sv388Dropdown"></div>' : ''}

      	</div>

      </div>
      </div>

            `;

      // Show SV388 dropdown if conditions are met
      if (shouldShowSV388) {
        setTimeout(() => showSV388Dropdown(), 100);
      }
    }
  });
});
