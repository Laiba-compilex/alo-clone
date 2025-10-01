async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=gavn138"
    );
    const data = await response.json();
    console.log("Response:", data);
    if (response.ok && data.url) {
      console.log("Base URL:", data.url);
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


const id = document.getElementById("userId");
if(localStorage.getItem('token')){
    const user = localStorage.getItem('user');
    const userObj = JSON.parse(user);
    id.innerHTML = `${userObj.user_id}`
}
async function copyId() {
    const id = document.getElementById("userId");
    
    if (!id) {
        alert('Error', 'User ID not found', 'error');
        return;
    }
    
    const textToCopy = id.innerText || id.textContent;
    
    try {
        await navigator.clipboard.writeText(textToCopy);
        alert('Success', `ID copied: ${textToCopy}`, 'success');
    } catch (err) {
        console.error("Failed to copy:", err);
        
        // Fallback for older browsers
        const tempInput = document.createElement("input");
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        
        try {
            document.execCommand("copy");
            alert('Success', `ID copied: ${textToCopy}`, 'success');
        } catch (fallbackErr) {
            alert('Error', 'Failed to copy ID', 'error');
        }
        
        document.body.removeChild(tempInput);
    }
}

// function setAmount(value) {
//     const input = document.getElementById('inp_vnd_amount1');
//     if (input) {
//         input.value = value;
//         // Trigger input event for any listeners
//         input.dispatchEvent(new Event('input', { bubbles: true }));
//     }
// }

// function addAmount(value) {
//     const input = document.getElementById('inp_vnd_amount1');
//     if (input) {
//         const currentValue = parseFloat(input.value) || 0;
//         const newValue = currentValue + value;
//         input.value = newValue;
//         input.dispatchEvent(new Event('input', { bubbles: true }));
//     }
// }
// Function to set amount in the input field with Vietnamese name
function setAmount(value) {
    const input = document.getElementById('inp_vnd_amount1');
    const numberName = document.getElementById('numberName');
    
    // Vietnamese number names mapping
    const vietnameseNames = {
        500: 'năm trăm nghìn đồng',
        1000: 'một triệu đồng',
        2000: 'hai triệu đồng',
        5000: 'năm triệu đồng',
        10000: 'mười triệu đồng',
        20000: 'hai mươi triệu đồng'
    };
    
    if (input) {
        input.value = value;
        // Trigger input event for any listeners
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (numberName) {
        numberName.textContent = vietnameseNames[value] || '';
    }
}

// Alternative: If you want to ADD to existing value instead of replacing
function addAmount(value) {
    const input = document.getElementById('inp_vnd_amount1');
    const numberName = document.getElementById('numberName');
    
    const vietnameseNames = {
        500: 'năm trăm nghìn đồng',
        1000: 'một triệu đồng',
        2000: 'hai triệu đồng',
        5000: 'năm triệu đồng',
        10000: 'mười triệu đồng',
        20000: 'hai mươi triệu đồng'
    };
    
    if (input) {
        const currentValue = parseFloat(input.value) || 0;
        const newValue = currentValue + value;
        input.value = newValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Update Vietnamese name if it matches a predefined value
        if (numberName && vietnameseNames[newValue]) {
            numberName.textContent = vietnameseNames[newValue];
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    APIGetCompanyBanks();
    const vietnameseNames = {
        500: 'năm trăm nghìn đồng',
        1000: 'một triệu đồng',
        2000: 'hai triệu đồng',
        5000: 'năm triệu đồng',
        10000: 'mười triệu đồng',
        20000: 'hai mươi triệu đồng'
    };
    
    // Get all amount buttons
    const buttons = document.querySelectorAll('.p-button-help');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the label text (e.g., "500K", "1,000K")
            const label = this.querySelector('.p-button-label').textContent;
            
            // Remove 'K' and commas, convert to number
            const value = parseFloat(label.replace(/[K,]/g, ''));
            
            // Set the value in input
            const input = document.getElementById('inp_vnd_amount1');
            const numberName = document.getElementById('numberName');
            
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            if (numberName && vietnameseNames[value]) {
                numberName.textContent = vietnameseNames[value];
            }
        });
    });
});

function toggleBankDropdown() {
    const trigger1 = document.getElementById("ddlBank1");
    const menu = document.getElementById('bankDropdownMenu');
    
    trigger1.classList.toggle('active');
    menu.classList.toggle('show');
}

function selectOption(element, mainText, subText, color) {
    // Update the trigger text
    const trigger1 = document.getElementById('ddlBank1');
    const label = trigger1.querySelector('.dropdown-label .white-space-normal div');
    label.innerHTML = mainText + ' <i style="color: ' + color + ';">' + subText + '</i>';
    
    // Remove selected class from all items
    const items = document.querySelectorAll('#bankDropdownMenu .dropdown-item1');
    items.forEach(item => item.classList.remove('selected'));
    
    // Add selected class to clicked item
    element.classList.add('selected');
    
    // Close dropdown
    toggleBankDropdown();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-container1');
    const trigger1 = document.getElementById('ddlBank1');
    const menu = document.getElementById('bankDropdownMenu');
    
    if (dropdown && !dropdown.contains(event.target)) {
        trigger1.classList.remove('active');
        menu.classList.remove('show');
    }
});
function togglePromotionDropdown() {
    const trigger = document.getElementById('ddlPromotion');
    const menu = document.getElementById('dropdownMenu');
    
    trigger.classList.toggle('active');
    menu.classList.toggle('show');
}

function selectOption(element, mainText, subText, color) {
    // Update the trigger text
    const trigger = document.getElementById('ddlPromotion');
    const label = trigger.querySelector('.dropdown-label .white-space-normal div');
    label.innerHTML = mainText + ' <i style="color: ' + color + ';">' + subText + '</i>';
    
    // Remove selected class from all items
    const items = document.querySelectorAll('.dropdown-item');
    items.forEach(item => item.classList.remove('selected'));
    
    // Add selected class to clicked item
    element.classList.add('selected');
    
    // Close dropdown
    toggleDropdown();
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown-container');
    const trigger = document.getElementById('ddlPromotion');
    
    if (dropdown && !dropdown.contains(event.target)) {
        trigger.classList.remove('active');
        document.getElementById('dropdownMenu').classList.remove('show');
    }
});


//allow deposit api
async function depositAllowed() {
  const BaseUrl = await fetchBaseURL();
  return await fetch(`${BaseUrl}('/api/player/check/allow/deposit'`, {
   method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        accept: "application/json",
      },
  });
}


// deposit api 
async function APIMakeDepositRequest (amount, bank_id, payment_method, payment_method_code, category_id,
  category_code) {
  const BaseUrl = await fetchBaseURL();
  var formData = new FormData();
  formData.append("transaction_amount", amount * 1000);
  formData.append("bank_id", Number(bank_id) || null);
  formData.append("payment_method", Number(payment_method) || null);
  formData.append("payment_method_code", payment_method_code || null);
  formData.append("category_id", Number(category_id) || null);
  formData.append("category_code", category_code || null);
  const token = localStorage.getItem('auth_token');

  try {
    const res = await fetch(`${BaseUrl}"/api/account/deposit"`, formData, {
     method: "POST",
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        accept: "application/json",
      }
    });
    if (res.status === 200) {
      toast.success("Your amount has been deposited sccessfully!")
      return res?.data?.data;
    }
  } catch (e) {
    if (e.response.data.message === "YOU_HAVE_PENDING_TRANSACTION") {
      return "YOU_HAVE_PENDING_TRANSACTION";
    } else if (e.response.data.message === 'FAILD_TO_GET_QR') {
      return "FAILD_TO_GET_QR"
    } else if (e.response.data.message === 'NETWORK_ERROR') {
      return "NETWORK_ERROR"
    } else if (e.response.data.message === 'WRONG_PAYMENT_METHOD') {
      return "WRONG_PAYMENT_METHOD"
    } else if (e.response.data.message === 'BANK_NOT_SUPPORTED') {
      return "BANK_NOT_SUPPORTED"
    } else {
      console.log(e)
      return null
    }
  }
  return null;
}



async function APIGetCompanyBanks() {
  const BaseUrl = await fetchBaseURL();

  try {
    const res = await fetch(`${BaseUrl}/api/bank/all`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        accept: "application/json",
      }
    });
    const data = await res.json();
    console.log("banks list", data);
    if (data && data.length) {
      renderBanksList(data);
      return data;
    }
  } catch (e) {
    console.log(e);
  }
  return null;
}

function renderBanksList(banks) {
  const dropdownMenu = document.getElementById('bankDropdownMenu');
  
  // Clear existing items
  dropdownMenu.innerHTML = '';
  
  // Render each bank
  banks.forEach((bank, index) => {
    const bankItem = document.createElement('div');
    bankItem.className = 'dropdown-item1' + (index === 0 ? ' selected' : '');
    
    // Adjust these property names based on your actual API response structure
    const bankName = bank.bank_name || bank.bank_name || '';
    const bankCode = bank.code || bank.bankCode || '';
    const bankId = bank.id || bank.id || '';
    
    bankItem.onclick = function() {
      selectBankOption(this, bankName, bankCode, bankId);
    };
    
    bankItem.innerHTML = `
      <div>${bankName} <span style="color: #94a3b8;" id="${bankCode}"></span></div>
    `;
    
    dropdownMenu.appendChild(bankItem);
  });
  
  // Set the first bank as default in the trigger
  if (banks.length > 0) {
    const firstBank = banks[0];
    const bankName = firstBank.bank_name || firstBank.bank_name || '';
    const bankCode = firstBank.id || firstBank.id || '';
    
    const trigger = document.getElementById('ddlBank1');
    const label = trigger.querySelector('.dropdown-label .white-space-normal div');
    label.innerHTML = `${bankName} <span style="color: #94a3b8;" id="${bankCode}"></span>`;
  }
}

function selectBankOption(element, bankName, bankCode, bankId) {
  // Update the trigger text
  const trigger = document.getElementById('ddlBank1');
  const label = trigger.querySelector('.dropdown-label .white-space-normal div');
  label.innerHTML = `${bankName} <span style="color: #94a3b8;" id="${bankCode}"></span>`;
  
  // Remove selected class from all items
  const items = document.querySelectorAll('#bankDropdownMenu .dropdown-item1');
  items.forEach(item => item.classList.remove('selected'));
  
  // Add selected class to clicked item
  element.classList.add('selected');
  
  // Store selected bank data (optional)
  console.log('Selected Bank:', { bankName, bankCode, bankId });
  
  // You can store it in a hidden input or variable for form submission
  // document.getElementById('selectedBankId').value = bankId;
  
  // Close dropdown
  toggleBankDropdown();
}
