// Bank management system
let userBanks = [];

// Fetch user banks
async function fetchUserBanks() {
  const API_BASE_URL = await fetchBaseURL();
  const token = localStorage.getItem("token");

  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/player/active/banks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    if (!response) return [];

    if (response.ok) {
      const result = await response.json();
      if (result.status && result.response) {
        userBanks = result.response;
        return result.response;
      }
    }
  } catch (error) {
    console.error("Error fetching banks:", error);
  }
  return [];
}

// Get selected bank for withdrawal
function getSelectedBank() {
  const selectedBank = document.querySelector(".bank-item.selected");
  if (selectedBank) {
    return {
      bank_id: parseInt(selectedBank.dataset.bankId),
      account_number: selectedBank.dataset.account,
    };
  }
  return null;
}

// Display banks in the UI
async function displayBanks() {
  const bankPanel = document.getElementById("bankTransferPanel");
  if (!bankPanel) return;

  bankPanel.innerHTML =
    '<div class="text-center p-3"><p>Đang tải danh sách ngân hàng...</p></div>';

  const banks = await fetchUserBanks();

  if (banks.length === 0) {
    bankPanel.innerHTML = `
      <div class="text-center p-3">
        <p>Chưa có tài khoản ngân hàng nào được liên kết.</p>
        <p>Vui lòng thêm tài khoản ngân hàng để tiếp tục.</p>
      </div>
    `;
    return;
  }

  const bankCards = banks
    .map(
      (bank, index) => `
    <div class="bank-card bank-item ${
      index === 0 ? "selected" : ""
    }" data-bank-id="${bank.id}" data-account="${bank.account_number}">
      <button 
        class="delete-bank-btn" 
        data-bank-id="${bank.id}"
        onclick="event.stopPropagation(); confirmDeleteBank(${bank.id}, '${
        bank.bank_name
      }')"
        title="Xóa tài khoản ngân hàng"
      >
        <i class="pi pi-trash"></i>
      </button>
      <div class="bank-info">
        <div class="bank-name">${bank.bank_name}</div>
        <div class="account-number">${bank.account_number}</div>
        <div class="account-holder">${bank.User_name}</div>
      </div>
      <div class="radio-indicator ${index === 0 ? "selected" : ""}"></div>
    </div>
  `
    )
    .join("");

  bankPanel.innerHTML = `
    <div class="banks-container">
      <div class="banks-grid">
        ${bankCards}
      </div>
    </div>
  `;

  // Add click handlers for bank selection
  document.querySelectorAll(".bank-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".bank-item")
        .forEach((i) => i.classList.remove("selected"));
      document
        .querySelectorAll(".radio-indicator")
        .forEach((i) => i.classList.remove("selected"));
      this.classList.add("selected");
      this.querySelector(".radio-indicator").classList.add("selected");
    });
  });
}

// Refresh bank list
async function refreshBankList() {
  await displayBanks();
}

// Make functions globally available
window.displayBanks = displayBanks;
window.refreshBankList = refreshBankList;
window.fetchUserBanks = fetchUserBanks;

// Ensure functions are available immediately
if (typeof window !== "undefined") {
  window.displayBanks = displayBanks;
  window.refreshBankList = refreshBankList;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  displayBanks();
});
