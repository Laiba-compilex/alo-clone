// Add Bank API Implementation
async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=staging"
    );
    const data = await response.json();
    if (response.ok && data.url) {
      return data.url;
    } else {
      throw new Error("Invalid response for base URL");
    }
  } catch (error) {
    console.error("Error fetching base URL:", error);
    return "https://bo.gagavn138.com"; // Fallback URL
  }
}

// Add new bank account
async function addBankAccount(bankName, accountNumber, accountHolder) {
  try {
    const baseURL = await fetch("https://cdntracker0019.com?site_code=staging")
      .then(res => res.json())
      .then(data => data.url)
      .catch(() => "https://bo.gagavn138.com");
    
    const token = localStorage.getItem("token");

    if (!token) {
      return {
        success: false,
        message: "Vui lòng đăng nhập để thực hiện thao tác này"
      };
    }

    const formData = new FormData();
    formData.append("bank_name", bankName);
    formData.append("account_number", accountNumber);
    formData.append("User_name", accountHolder);

    console.log("Adding bank account:", { bankName, accountNumber, accountHolder });
    console.log("API URL:", `${baseURL}/api/bank/add_user_bank`);

    const response = await fetch(`${baseURL}/api/bank/add_user_bank`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });

    console.log("Response status:", response.status);
    const result = await response.json();
    console.log("Response data:", result);

    if (response.ok && result.status) {
      return {
        success: true,
        message: "Tài khoản ngân hàng đã được thêm thành công!",
        data: result
      };
    } else {
      // Handle validation errors
      let errorMessage = "Có lỗi xảy ra khi thêm tài khoản ngân hàng";
      
      if (result && typeof result === 'object') {
        // Handle Laravel validation errors format
        if (result.account_number) {
          errorMessage = result.account_number[0] || errorMessage;
        } else if (result.bank_name) {
          errorMessage = result.bank_name[0] || errorMessage;
        } else if (result.User_name) {
          errorMessage = result.User_name[0] || errorMessage;
        } else if (result.message) {
          errorMessage = result.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        data: result
      };
    }
  } catch (error) {
    console.error("Error adding bank account:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi kết nối với máy chủ",
      error: error
    };
  }
}

// Get available bank codes for validation
async function getAvailableBanks() {
  const API_BASE_URL = await fetchBaseURL();
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_BASE_URL}/api/bankcodes/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error("Error fetching available banks:", error);
  }
  return [];
}

// Vietnamese bank list for validation
const vietnamBanks = [
  "TCBANK", "VIETINBANK", "DONGABANK", "BIDV", "ACB", "SACOMBANK", 
  "VPBANK", "MBBANK", "SHBBANK", "TPB", "MSB", "VIBBANK", "VCB", 
  "AB BANK", "AGRIBANK", "HDBANK", "NAMABANK", "PVCOMBANK", 
  "SAIGONBANK", "SHINHANBANK"
];

// Validate bank name
function validateBankName(bankName) {
  const upperBankName = bankName.toUpperCase();
  return vietnamBanks.some(bank => 
    upperBankName.includes(bank) || bank.includes(upperBankName)
  );
}

// Validate account number (Vietnamese bank account format)
function validateAccountNumber(accountNumber) {
  // Remove spaces and special characters
  const cleanNumber = accountNumber.replace(/\s+/g, '');
  
  // Vietnamese bank account numbers are typically 6-19 digits
  const accountRegex = /^\d{6,19}$/;
  return accountRegex.test(cleanNumber);
}

// Validate account holder name (Vietnamese name format)
function validateAccountHolder(accountHolder) {
  // Vietnamese name should contain only letters, spaces, and Vietnamese characters
  const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
  return nameRegex.test(accountHolder.trim()) && accountHolder.trim().length >= 2;
}

// Handle form submission
async function handleBankAccountSubmission(event) {
  event.preventDefault();
  
  const bankName = document.getElementById("bankName").value.trim();
  const accountNumber = document.getElementById("accountNumber").value.trim();
  const accountHolder = document.getElementById("accountHolder").value.trim();

  // Final validation before submission
  const bankNameValid = validateBankName(bankName);
  const accountNumberValid = validateAccountNumber(accountNumber);
  const accountHolderValid = validateAccountHolder(accountHolder);

  if (!bankNameValid || !accountNumberValid || !accountHolderValid) {
    // Trigger validation display
    if (window.validateBankNameInput) {
      window.validateBankNameInput(document.getElementById("bankName"));
      window.validateAccountNumberInput(document.getElementById("accountNumber"));
      window.validateAccountHolderInput(document.getElementById("accountHolder"));
    }
    
    alert("Vui lòng kiểm tra lại thông tin đã nhập");
    return;
  }

  // Show loading state
  const submitBtn = document.querySelector('#bankAccountForm button[type="submit"]');
  if (window.setButtonLoading) {
    window.setButtonLoading(submitBtn, true);
  } else {
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang xử lý...";
  }

  try {
    const result = await addBankAccount(bankName, accountNumber, accountHolder);
    
    if (result.success) {
      // Close the add bank modal
      if (window.closeModal) {
        window.closeModal();
      }
      
      // Show success modal
      if (window.openSuccessModal) {
        window.openSuccessModal(result.message);
      } else {
        showSuccessModal(result.message);
      }
      
      // Refresh the bank list
      if (window.refreshBankList) {
        await window.refreshBankList();
      } else if (window.displayBanks) {
        await window.displayBanks();
      }
      
      // Clear form
      document.getElementById("bankAccountForm").reset();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error submitting bank account:", error);
    alert("Có lỗi xảy ra khi thêm tài khoản ngân hàng");
  } finally {
    // Reset button state
    if (window.setButtonLoading) {
      window.setButtonLoading(submitBtn, false);
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = "Liên kết tài khoản";
    }
  }
}

// Show success modal
function showSuccessModal(message) {
  const successModal = document.getElementById("secondModal");
  const messageElement = successModal.querySelector("p");
  messageElement.textContent = message;
  successModal.style.display = "block";
}

// Direct submit function for onclick
async function submitBankAccount() {
  const bankName = document.getElementById("bankName").value.trim();
  const accountNumber = document.getElementById("accountNumber").value.trim();
  const accountHolder = document.getElementById("accountHolder").value.trim();

  if (!bankName || !accountNumber || !accountHolder) {
    alert("Vui lòng điền đầy đủ thông tin");
    return;
  }

  const submitBtn = document.getElementById("submitBankBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Đang xử lý...";

  try {
    const result = await addBankAccount(bankName, accountNumber, accountHolder);
    
    if (result.success) {
      closeModal();
      openSuccessModal(result.message);
      if (window.refreshBankList) {
        await window.refreshBankList();
      }
      document.getElementById("bankAccountForm").reset();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Có lỗi xảy ra");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Liên kết tài khoản";
  }
}

// Make function globally available
window.submitBankAccount = submitBankAccount;

// Initialize the add bank functionality
document.addEventListener("DOMContentLoaded", function() {
  const bankForm = document.getElementById("bankAccountForm");
  if (bankForm) {
    bankForm.addEventListener("submit", function(e) {
      e.preventDefault();
      submitBankAccount();
    });
  }

  // Add input formatting for account number
  const accountNumberInput = document.getElementById("accountNumber");
  if (accountNumberInput) {
    accountNumberInput.addEventListener("input", function(e) {
      // Remove non-numeric characters
      let value = e.target.value.replace(/\D/g, '');
      
      // Limit to 19 digits
      if (value.length > 19) {
        value = value.substring(0, 19);
      }
      
      e.target.value = value;
    });
  }

  // Add input formatting for account holder name
  const accountHolderInput = document.getElementById("accountHolder");
  if (accountHolderInput) {
    accountHolderInput.addEventListener("input", function(e) {
      // Convert to uppercase for consistency
      e.target.value = e.target.value.toUpperCase();
    });
  }

  // Add bank name suggestions
  const bankNameInput = document.getElementById("bankName");
  if (bankNameInput) {
    bankNameInput.addEventListener("input", function(e) {
      const value = e.target.value.toUpperCase();
      
      // Auto-complete common bank names
      const suggestions = vietnamBanks.filter(bank => 
        bank.includes(value) && value.length > 2
      );
      
      if (suggestions.length === 1 && value.length > 2) {
        // Auto-suggest the bank name
        const suggestion = suggestions[0];
        if (suggestion.startsWith(value)) {
          e.target.value = suggestion;
          // Select the auto-completed part
          e.target.setSelectionRange(value.length, suggestion.length);
        }
      }
    });
  }
});