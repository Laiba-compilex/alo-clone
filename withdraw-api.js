async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=gavn138"
    );
    const data = await response.json();
    console.log("Response:", data);
    if (response.ok && data.url) {
      console.log("Base URL:", data.url);
      return data.url + "/api";
    } else {
      throw new Error("Invalid response for base URL");
    }
  } catch (error) {
    console.error("Error fetching base URL:", error);
    return "https://bo.gagavn138.com/api"; // Use the correct staging URL
  }
}

// Fetch user banks
async function fetchUserBanks() {
  const API_BASE_URL = await fetchBaseURL();
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(`${API_BASE_URL}/player/active/banks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.status ? result.response : [];
    }
  } catch (error) {
    console.error('Error fetching banks:', error);
  }
  return [];
}

// Display banks in UI
async function displayBanks() {
  const banks = await fetchUserBanks();
  const bankPanel = document.getElementById('bankTransferPanel');
  
  if (banks.length === 0) {
    bankPanel.innerHTML = '<div class="text-center p-3"><p>Đang tải...</p></div>';
    return;
  }
  
  let bankHTML = '<div class="bank-list">';
  banks.forEach((bank, index) => {
    bankHTML += `
      <div class="bank-item p-3 mb-2 border cursor-pointer ${index === 0 ? 'selected' : ''}" data-bank-id="${bank.id}" data-account="${bank.account_number}">
        <div class="flex justify-content-between align-items-center">
          <div>
            <strong>${bank.bank_name}</strong><br>
            <span class="text-sm text-gray-600">${bank.account_number}</span><br>
            <span class="text-sm text-gray-600">${bank.User_name}</span>
          </div>
          <div class="radio-indicator ${index === 0 ? 'selected' : ''}"></div>
        </div>
      </div>`;
  });
  bankHTML += '</div>';
  
  bankPanel.innerHTML = bankHTML;
  
  // Add click handlers
  document.querySelectorAll('.bank-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.bank-item').forEach(i => i.classList.remove('selected'));
      document.querySelectorAll('.radio-indicator').forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      this.querySelector('.radio-indicator').classList.add('selected');
    });
  });
}

async function submitWithdraw() {
  const API_BASE_URL = await fetchBaseURL();
  const amountInput = document.getElementById("inp_vnd_amount");
  const amount = parseInt(amountInput.value) * 1000; // Convert to VND

  if (!amount || amount < 0 || amount > 100000000) {
    alert("Vui lòng nhập số tiền hợp lệ (0 - 100,000,000 VND)");
    return;
  }

  // Get selected bank data
  const selectedBank = document.querySelector('.bank-item.selected');
  if (!selectedBank) {
    alert('Vui lòng chọn tài khoản ngân hàng');
    return;
  }
  
  const withdrawData = {
    bank_id: parseInt(selectedBank.dataset.bankId),
    transaction_amount: amount,
    bank_account_number: selectedBank.dataset.account,
  };

  try {
    // Use token as primary token
    const token = localStorage.getItem("token");

    console.log("Available localStorage keys:", Object.keys(localStorage));

    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện giao dịch");
      return;
    }

    const formData = new FormData();
    formData.append("bank_id", withdrawData.bank_id);
    formData.append("transaction_amount", withdrawData.transaction_amount);
    formData.append("bank_account_number", withdrawData.bank_account_number);
    // Add reject_previous parameter (matching sv388-player implementation)
    formData.append("reject_previous", false);

    // Show loading state
    const submitBtn = document.getElementById("btnCreateWithdraw");
    const originalText = submitBtn.querySelector(".p-button-label").textContent;
    submitBtn.querySelector(".p-button-label").textContent = "Đang xử lý...";
    submitBtn.disabled = true;

    console.log("API URL:", `${API_BASE_URL}/account/withdraw`);
    console.log("Token:", token ? "Present" : "Missing");
    console.log("Payload:", Object.fromEntries(formData));

    const response = await fetch(`${API_BASE_URL}/account/withdraw`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Reset button state
    submitBtn.querySelector(".p-button-label").textContent = originalText;
    submitBtn.disabled = false;

    // Handle 302 redirect (authentication issue)
    if (response.status === 302) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
      return;
    }

    if (response.ok) {
      const result = await response.json();
      if (result.status) {
        alert("Yêu cầu rút tiền đã được tạo thành công!");
        window.location.href = "/transactions";
      } else {
        handleWithdrawError(result.message || "Có lỗi xảy ra");
      }
    } else {
      // Handle HTTP error responses
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 403) {
        handleWithdrawError("WAIT_PLEASE");
      } else if (response.status === 401) {
        handleWithdrawError("MAKE_DEPOSIT_REQUEST_FIRST");
      } else if (response.status === 429) {
        handleWithdrawError("Transaction_limit_over");
      } else {
        handleWithdrawError(errorData.message || "Có lỗi xảy ra");
      }
    }
  } catch (error) {
    // Reset button state on error
    const submitBtn = document.getElementById("btnCreateWithdraw");
    if (submitBtn) {
      submitBtn.querySelector(".p-button-label").textContent =
        "Tạo lệnh rút tiền";
      submitBtn.disabled = false;
    }

    console.error("Withdraw error:", error);
    alert("Có lỗi xảy ra khi xử lý yêu cầu rút tiền");
  }
}

function handleWithdrawError(errorCode) {
  const errorMessages = {
    PLAYER_NOT_ALLOWED_TO_WITHDRAW:
      "Tài khoản của bạn không được phép rút tiền",
    INSUFFICIENT_BALANCE: "Số dư không đủ để thực hiện giao dịch",
    LESS_THEN_MINIMUM_LIMIT: "Số tiền rút thấp hơn mức tối thiểu",
    Transaction_limit_over: "Đã vượt quá giới hạn giao dịch",
    WAIT_PLEASE: "Bạn có giao dịch đang chờ xử lý",
    MAKE_DEPOSIT_REQUEST_FIRST:
      "Vui lòng thực hiện nạp tiền trước khi rút tiền",
    YOU_HAVE_PENDING_TRANSACTION: "Bạn có giao dịch đang chờ xử lý",
  };

  const message =
    errorMessages[errorCode] || errorCode || "Có lỗi xảy ra khi rút tiền";
  alert(message);
}

// Update amount display in Vietnamese
function updateAmountDisplay() {
  const amountInput = document.getElementById("inp_vnd_amount");
  const vnTextSpan = document.querySelector(".vn-text");

  if (amountInput && vnTextSpan) {
    const amount = parseInt(amountInput.value) || 0;
    vnTextSpan.textContent = convertNumberToVietnamese(amount * 1000);
  }
}

function convertNumberToVietnamese(number) {
  if (number === 0) return "không đồng";

  const units = ["", "nghìn", "triệu", "tỷ"];
  const digits = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];

  if (number === 200000) return "hai trăm nghìn đồng";
  if (number === 500000) return "năm trăm nghìn đồng";
  if (number === 1000000) return "một triệu đồng";

  return number.toLocaleString("vi-VN") + " đồng";
}

// Add event listeners
document.addEventListener("DOMContentLoaded", function () {
  const amountInput = document.getElementById("inp_vnd_amount");
  const form = document.querySelector("form");

  // Load banks on page load
  displayBanks();

  if (amountInput) {
    amountInput.addEventListener("input", updateAmountDisplay);
  }

  // Prevent form submission
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitWithdraw();
    });
  }

  // Add Enter key support for amount input
  if (amountInput) {
    amountInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitWithdraw();
      }
    });
  }
});
