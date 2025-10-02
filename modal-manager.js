// Modal Management Functions

// Open the add bank modal
function openModal() {
  const modal = document.getElementById("withdrawModal");
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent background scrolling
    
    // Focus on first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }
}

// Close the add bank modal
function closeModal() {
  const modal = document.getElementById("withdrawModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto"; // Restore scrolling
    
    // Clear form data
    const form = document.getElementById("bankAccountForm");
    if (form) {
      form.reset();
      clearValidationStates();
    }
  }
}

// Open the success modal
function openSuccessModal(message = "Tài khoản ngân hàng đã được thêm thành công!") {
  const modal = document.getElementById("secondModal");
  const messageElement = modal.querySelector("p");
  
  if (modal && messageElement) {
    messageElement.textContent = message;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// Close the success modal
function closeSecondModal() {
  const modal = document.getElementById("secondModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Clear validation states from form inputs
function clearValidationStates() {
  const inputs = document.querySelectorAll('#bankAccountForm input');
  inputs.forEach(input => {
    input.classList.remove('input-error', 'input-success');
  });
}

// Add validation visual feedback
function setInputValidation(inputId, isValid, message = '') {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  // Remove existing classes
  input.classList.remove('input-error', 'input-success');
  
  // Add appropriate class
  if (isValid === true) {
    input.classList.add('input-success');
  } else if (isValid === false) {
    input.classList.add('input-error');
  }
  
  // Handle error message display
  let errorElement = input.parentNode.querySelector('.error-message');
  
  if (message && !isValid) {
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.style.cssText = 'color: #e53e3e; font-size: 0.8rem; margin-top: 4px;';
      input.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
  } else if (errorElement) {
    errorElement.remove();
  }
}

// Real-time validation for bank name
function validateBankNameInput(input) {
  const value = input.value.trim().toUpperCase();
  const vietnamBanks = [
    "TCBANK", "VIETINBANK", "DONGABANK", "BIDV", "ACB", "SACOMBANK", 
    "VPBANK", "MBBANK", "SHBBANK", "TPB", "MSB", "VIBBANK", "VCB", 
    "AB BANK", "AGRIBANK", "HDBANK", "NAMABANK", "PVCOMBANK", 
    "SAIGONBANK", "SHINHANBANK", "TECHCOMBANK", "VIETCOMBANK"
  ];
  
  if (value.length === 0) {
    setInputValidation('bankName', null);
    return null;
  }
  
  if (value.length < 3) {
    setInputValidation('bankName', false, 'Tên ngân hàng quá ngắn');
    return false;
  }
  
  const isValid = vietnamBanks.some(bank => 
    bank.includes(value) || value.includes(bank)
  );
  
  if (isValid) {
    setInputValidation('bankName', true);
    return true;
  } else {
    setInputValidation('bankName', false, 'Tên ngân hàng không hợp lệ');
    return false;
  }
}

// Real-time validation for account number
function validateAccountNumberInput(input) {
  const value = input.value.replace(/\s+/g, '');
  
  if (value.length === 0) {
    setInputValidation('accountNumber', null);
    return null;
  }
  
  if (!/^\d+$/.test(value)) {
    setInputValidation('accountNumber', false, 'Chỉ được nhập số');
    return false;
  }
  
  if (value.length < 6) {
    setInputValidation('accountNumber', false, 'Số tài khoản phải có ít nhất 6 chữ số');
    return false;
  }
  
  if (value.length > 19) {
    setInputValidation('accountNumber', false, 'Số tài khoản không được quá 19 chữ số');
    return false;
  }
  
  setInputValidation('accountNumber', true);
  return true;
}

// Real-time validation for account holder
function validateAccountHolderInput(input) {
  const value = input.value.trim();
  
  if (value.length === 0) {
    setInputValidation('accountHolder', null);
    return null;
  }
  
  if (value.length < 2) {
    setInputValidation('accountHolder', false, 'Tên quá ngắn');
    return false;
  }
  
  // Vietnamese name validation
  const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;
  
  if (!nameRegex.test(value)) {
    setInputValidation('accountHolder', false, 'Tên chỉ được chứa chữ cái và khoảng trắng');
    return false;
  }
  
  setInputValidation('accountHolder', true);
  return true;
}

// Show loading state on button
function setButtonLoading(buttonElement, isLoading) {
  if (!buttonElement) return;
  
  if (isLoading) {
    buttonElement.disabled = true;
    buttonElement.classList.add('loading');
    buttonElement.dataset.originalText = buttonElement.textContent;
    buttonElement.textContent = 'Đang xử lý...';
  } else {
    buttonElement.disabled = false;
    buttonElement.classList.remove('loading');
    if (buttonElement.dataset.originalText) {
      buttonElement.textContent = buttonElement.dataset.originalText;
      delete buttonElement.dataset.originalText;
    }
  }
}

// Initialize modal event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const withdrawModal = document.getElementById('withdrawModal');
    const successModal = document.getElementById('secondModal');
    
    if (event.target === withdrawModal) {
      closeModal();
    }
    
    if (event.target === successModal) {
      closeSecondModal();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const withdrawModal = document.getElementById('withdrawModal');
      const successModal = document.getElementById('secondModal');
      
      if (withdrawModal && withdrawModal.style.display === 'block') {
        closeModal();
      }
      
      if (successModal && successModal.style.display === 'block') {
        closeSecondModal();
      }
    }
  });
  
  // Ensure form submission works
  const bankForm = document.getElementById('bankAccountForm');
  if (bankForm) {
    bankForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (window.handleBankAccountSubmission) {
        window.handleBankAccountSubmission(e);
      }
    });
  }
  
  // Add real-time validation to inputs
  const bankNameInput = document.getElementById('bankName');
  const accountNumberInput = document.getElementById('accountNumber');
  const accountHolderInput = document.getElementById('accountHolder');
  
  if (bankNameInput) {
    bankNameInput.addEventListener('input', function() {
      validateBankNameInput(this);
    });
    
    bankNameInput.addEventListener('blur', function() {
      validateBankNameInput(this);
    });
  }
  
  if (accountNumberInput) {
    accountNumberInput.addEventListener('input', function() {
      // Remove non-numeric characters
      let value = this.value.replace(/\D/g, '');
      if (value.length > 19) {
        value = value.substring(0, 19);
      }
      this.value = value;
      
      validateAccountNumberInput(this);
    });
    
    accountNumberInput.addEventListener('blur', function() {
      validateAccountNumberInput(this);
    });
  }
  
  if (accountHolderInput) {
    accountHolderInput.addEventListener('input', function() {
      // Convert to uppercase
      this.value = this.value.toUpperCase();
      validateAccountHolderInput(this);
    });
    
    accountHolderInput.addEventListener('blur', function() {
      validateAccountHolderInput(this);
    });
  }
});

// Export functions for global use
window.openModal = openModal;
window.closeModal = closeModal;
window.openSuccessModal = openSuccessModal;
window.closeSecondModal = closeSecondModal;
window.setButtonLoading = setButtonLoading;