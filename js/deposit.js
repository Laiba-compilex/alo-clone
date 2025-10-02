// Authentication wrapper for fetch
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "index.html";
      return null;
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

async function fetchBaseURL() {
  try {
    const response = await fetch(
      "https://cdntracker0019.com?site_code=staging",
      { mode: "cors" }
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
    return "https://bo.gagavn138.com";
  }
}

const id = document.getElementById("userId");
const deposit_id = document.getElementById("balance_field");
if (localStorage.getItem("token")) {
  const user = localStorage.getItem("user");
  const userObj = JSON.parse(user);
  id.innerHTML = `${userObj.user_id}`;
  deposit_id.innerHTML = `${userObj.balance}`;
}
async function copyId() {
  const id = document.getElementById("userId");

  if (!id) {
    alert("Error", "User ID not found", "error");
    return;
  }

  const textToCopy = id.innerText || id.textContent;

  try {
    await navigator.clipboard.writeText(textToCopy);
    alert("Success", `ID copied: ${textToCopy}`, "success");
  } catch (err) {
    console.error("Failed to copy:", err);

    // Fallback for older browsers
    const tempInput = document.createElement("input");
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);
    tempInput.select();

    try {
      document.execCommand("copy");
      alert("Success", `ID copied: ${textToCopy}`, "success");
    } catch (fallbackErr) {
      alert("Error", "Failed to copy ID", "error");
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
  const input = document.getElementById("inp_vnd_amount1");
  const numberName = document.getElementById("numberName");

  // Vietnamese number names mapping
  const vietnameseNames = {
    500: "năm trăm nghìn đồng",
    1000: "một triệu đồng",
    2000: "hai triệu đồng",
    5000: "năm triệu đồng",
    10000: "mười triệu đồng",
    20000: "hai mươi triệu đồng",
  };

  if (input) {
    input.value = value;
    // Trigger input event for any listeners
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (numberName) {
    numberName.textContent = vietnameseNames[value] || "";
  }
}

// Alternative: If you want to ADD to existing value instead of replacing
function addAmount(value) {
  const input = document.getElementById("inp_vnd_amount1");
  const numberName = document.getElementById("numberName");

  const vietnameseNames = {
    500: "năm trăm nghìn đồng",
    1000: "một triệu đồng",
    2000: "hai triệu đồng",
    5000: "năm triệu đồng",
    10000: "mười triệu đồng",
    20000: "hai mươi triệu đồng",
  };

  if (input) {
    const currentValue = parseFloat(input.value) || 0;
    const newValue = currentValue + value;
    input.value = newValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    // Update Vietnamese name if it matches a predefined value
    if (numberName && vietnameseNames[newValue]) {
      numberName.textContent = vietnameseNames[newValue];
    }
  }
}

let _paymentCategoriesCache = null;
let _aggregatedBanks = null; // array of {id, bank_name, bank_image, methods: [...]}

document.addEventListener("DOMContentLoaded", function () {
  APIGetPaymentCategoryDetails();
  const vietnameseNames = {
    500: "năm trăm nghìn đồng",
    1000: "một triệu đồng",
    2000: "hai triệu đồng",
    5000: "năm triệu đồng",
    10000: "mười triệu đồng",
    20000: "hai mươi triệu đồng",
  };

  // Get all amount buttons
  const buttons = document.querySelectorAll(".p-button-help");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // Get the label text (e.g., "500K", "1,000K")
      const label = this.querySelector(".p-button-label").textContent;

      // Remove 'K' and commas, convert to number
      const value = parseFloat(label.replace(/[K,]/g, ""));
      // Set the value in input
      const input = document.getElementById("inp_vnd_amount1");
      const numberName = document.getElementById("numberName");

      if (input) {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      if (numberName && vietnameseNames[value]) {
        numberName.textContent = vietnameseNames[value];
      }
    });
  });
});

function toggleBankDropdown() {
  const trigger1 = document.getElementById("ddlBank1");
  const menu = document.getElementById("bankDropdownMenu");

  trigger1.classList.toggle("active");
  menu.classList.toggle("show");
}

// New: fetch payment categories which include payment methods and their banks
async function APIGetPaymentCategoryDetails() {
  const BaseUrl = await fetchBaseURL();
  try {
    const res = await fetchWithAuth(
      `${BaseUrl}/api/bank/get_payment_category_details`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          accept: "application/json",
        },
      }
    );
    if (!res) return null;
    const data = await res.json();
    // cache
    _paymentCategoriesCache = data || [];
    // build aggregated bank list
    _aggregatedBanks = buildBankListFromCategories(_paymentCategoriesCache);
    // render banks dropdown
    if (_aggregatedBanks && _aggregatedBanks.length) {
      renderBanksList(_aggregatedBanks);
      // pre-select first bank if none selected
      const first = _aggregatedBanks[0];
      const selectedBankInput = document.getElementById("selectedBankId");
      if (first && selectedBankInput && !selectedBankInput.value) {
        selectedBankInput.value = first.id;
        // render payment methods for this bank
        renderPaymentMethodsForBank(first.id);
      }
    }
    return _paymentCategoriesCache;
  } catch (e) {
    console.error("Failed to load payment categories", e);
    return null;
  }
}

function buildBankListFromCategories(categories) {
  const map = new Map();
  const categoriesArray = Array.isArray(categories) ? categories : [];
  categoriesArray.forEach((cat) => {
    (cat.payment_methods || []).forEach((method) => {
      (method.payment_method_banks || []).forEach((bank) => {
        const bid = bank.id;
        if (!map.has(bid)) {
          map.set(bid, {
            id: bid,
            bank_name: bank.bank_name,
            bank_image: bank.bank_image,
            methods: [],
          });
        }
        // push method info (include code and id)
        map.get(bid).methods.push({
          id: method.id,
          name: method.payment_method_name,
          code: method.payment_method_code,
          image: method.payment_method_image,
          min: method.min_deposit_amount,
          max: method.max_deposit_amount,
          category: {
            id: cat.id,
            name: cat.name,
            code: cat.category_code,
          },
        });
      });
    });
  });
  return Array.from(map.values());
}

function renderPaymentMethodsForBank(bankId) {
  const paymentMenu = document.getElementById("paymentDropdownMenu");
  if (!paymentMenu) return;
  paymentMenu.innerHTML = "";
  const bank = (_aggregatedBanks || []).find(
    (b) => String(b.id) === String(bankId)
  );
  if (!bank) {
    paymentMenu.innerHTML = "<div>No payment methods for selected bank</div>";
    return;
  }
  bank.methods.forEach((m, idx) => {
    const div = document.createElement("div");
    div.className = "dropdown-item2" + (idx === 0 ? " selected" : "");
    div.textContent = m.name;
    // attach metadata for category and code
    div.dataset.code = m.code || "";
    div.dataset.categoryId = m.category?.id || "";
    div.dataset.categoryCode = m.category?.code || "";
    div.onclick = function () {
      selectPaymentMethod(
        this,
        m.name,
        m.id,
        m.code,
        m.category?.id,
        m.category?.code
      );
    };
    paymentMenu.appendChild(div);
  });
  // set hidden value to first method by default
  if (bank.methods.length > 0) {
    const first = bank.methods[0];
    const hidden = document.getElementById("selectedPaymentMethod");
    if (hidden) hidden.value = first.id;
    let hiddenCode = document.getElementById("selectedPaymentCode");
    if (!hiddenCode) {
      hiddenCode = document.createElement("input");
      hiddenCode.type = "hidden";
      hiddenCode.id = "selectedPaymentCode";
      hiddenCode.name = "selectedPaymentCode";
      document.querySelector("form.deposit-form")?.appendChild(hiddenCode);
    }
    hiddenCode.value = first.code;
    // also set hidden category id/code for this payment method
    let hiddenCatId = document.getElementById("selectedPaymentCategoryId");
    if (!hiddenCatId) {
      hiddenCatId = document.createElement("input");
      hiddenCatId.type = "hidden";
      hiddenCatId.id = "selectedPaymentCategoryId";
      hiddenCatId.name = "selectedPaymentCategoryId";
      document.querySelector("form.deposit-form")?.appendChild(hiddenCatId);
    }
    let hiddenCatCode = document.getElementById("selectedPaymentCategoryCode");
    if (!hiddenCatCode) {
      hiddenCatCode = document.createElement("input");
      hiddenCatCode.type = "hidden";
      hiddenCatCode.id = "selectedPaymentCategoryCode";
      hiddenCatCode.name = "selectedPaymentCategoryCode";
      document.querySelector("form.deposit-form")?.appendChild(hiddenCatCode);
    }
    hiddenCatId.value = first.category?.id || "";
    hiddenCatCode.value = first.category?.code || "";
  }
}

function selectOption(element, mainText, subText, color) {
  // Update the trigger text
  const trigger1 = document.getElementById("ddlBank1");
  const label = trigger1.querySelector(
    ".dropdown-label .white-space-normal div"
  );
  label.innerHTML =
    mainText + ' <i style="color: ' + color + ';">' + subText + "</i>";

  // Remove selected class from all items
  const items = document.querySelectorAll("#bankDropdownMenu .dropdown-item1");
  items.forEach((item) => item.classList.remove("selected"));

  // Add selected class to clicked item
  element.classList.add("selected");

  // Close dropdown
  toggleBankDropdown();
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".dropdown-container1");
  const trigger1 = document.getElementById("ddlBank1");
  const menu = document.getElementById("bankDropdownMenu");

  if (dropdown && !dropdown.contains(event.target)) {
    trigger1.classList.remove("active");
    menu.classList.remove("show");
  }
});
function togglePromotionDropdown() {
  const trigger = document.getElementById("ddlPromotion");
  const menu = document.getElementById("dropdownMenu");

  trigger.classList.toggle("active");
  menu.classList.toggle("show");
}

function selectOption(element, mainText, subText, color) {
  // Update the trigger text
  const trigger = document.getElementById("ddlPromotion");
  const label = trigger.querySelector(
    ".dropdown-label .white-space-normal div"
  );
  label.innerHTML =
    mainText + ' <i style="color: ' + color + ';">' + subText + "</i>";

  // Remove selected class from all items
  const items = document.querySelectorAll(".dropdown-item");
  items.forEach((item) => item.classList.remove("selected"));

  // Add selected class to clicked item
  element.classList.add("selected");

  // Close dropdown
  toggleDropdown();
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".dropdown-container");
  const trigger = document.getElementById("ddlPromotion");

  if (dropdown && !dropdown.contains(event.target)) {
    trigger.classList.remove("active");
    document.getElementById("dropdownMenu").classList.remove("show");
  }
});

//allow deposit api
async function depositAllowed() {
  const BaseUrl = await fetchBaseURL();
  return await fetchWithAuth(`${BaseUrl}/api/player/check/allow/deposit`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      accept: "application/json",
    },
  });
}
//payment dropdown
function togglePaymentDropdown() {
  const trigger = document.getElementById("ddlpayment");
  const menu = document.getElementById("paymentDropdownMenu");

  trigger.classList.toggle("active");
  menu.classList.toggle("show");
}

function selectPaymentMethod(element, paymentName, paymentId) {
  // Update the trigger text
  const trigger = document.getElementById("ddlpayment");
  const label = trigger.querySelector(".white-space-normal div");
  label.innerHTML = paymentName;

  // Remove selected class from all items
  const items = document.querySelectorAll(
    "#paymentDropdownMenu .dropdown-item2"
  );
  items.forEach((item) => item.classList.remove("selected"));

  // Add selected class to clicked item
  element.classList.add("selected");

  // Store selected payment method into hidden input (do NOT use localStorage)
  const hidden = document.getElementById("selectedPaymentMethod");
  if (hidden) hidden.value = paymentId;
  // store payment code as hidden input
  let hiddenCode = document.getElementById("selectedPaymentCode");
  if (!hiddenCode) {
    hiddenCode = document.createElement("input");
    hiddenCode.type = "hidden";
    hiddenCode.id = "selectedPaymentCode";
    hiddenCode.name = "selectedPaymentCode";
    document.querySelector("form.deposit-form")?.appendChild(hiddenCode);
  }
  // if fourth arg passed (code), set it
  if (arguments.length >= 4 && arguments[3]) {
    hiddenCode.value = arguments[3];
  }
  // set category id/code if provided
  let hiddenCatId = document.getElementById("selectedPaymentCategoryId");
  if (!hiddenCatId) {
    hiddenCatId = document.createElement("input");
    hiddenCatId.type = "hidden";
    hiddenCatId.id = "selectedPaymentCategoryId";
    hiddenCatId.name = "selectedPaymentCategoryId";
    document.querySelector("form.deposit-form")?.appendChild(hiddenCatId);
  }
  let hiddenCatCode = document.getElementById("selectedPaymentCategoryCode");
  if (!hiddenCatCode) {
    hiddenCatCode = document.createElement("input");
    hiddenCatCode.type = "hidden";
    hiddenCatCode.id = "selectedPaymentCategoryCode";
    hiddenCatCode.name = "selectedPaymentCategoryCode";
    document.querySelector("form.deposit-form")?.appendChild(hiddenCatCode);
  }
  if (arguments.length >= 6 && arguments[4] !== undefined)
    hiddenCatId.value = arguments[4] || "";
  if (arguments.length >= 6 && arguments[5] !== undefined)
    hiddenCatCode.value = arguments[5] || "";
  // also keep the payment name in a hidden field for possible use
  let hiddenName = document.getElementById("selectedPaymentName");
  if (!hiddenName) {
    hiddenName = document.createElement("input");
    hiddenName.type = "hidden";
    hiddenName.id = "selectedPaymentName";
    hiddenName.name = "selectedPaymentName";
    document.querySelector("form.deposit-form")?.appendChild(hiddenName);
  }
  hiddenName.value = paymentName;
  console.log("Selected Payment Method:", paymentName, "ID:", paymentId);
  // Close dropdown
  togglePaymentDropdown();
}

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  const dropdown = document.querySelector(".dropdown-container2");
  const trigger = document.getElementById("ddlpayment");
  const menu = document.getElementById("paymentDropdownMenu");

  if (dropdown && !dropdown.contains(event.target)) {
    trigger.classList.remove("active");
    menu.classList.remove("show");
  }
});

// deposit api
async function APIMakeDepositRequest(
  amount,
  bank_id,
  payment_method,
  payment_method_code
) {
  const BaseUrl = await fetchBaseURL();

  const payload = {
    transaction_amount: amount * 1000,
    bank_id: Number(bank_id),
    payment_method: Number(payment_method),
    payment_method_code: payment_method_code
  };

  const selectedCatId = document.getElementById("selectedPaymentCategoryId")?.value;
  const selectedCatCode = document.getElementById("selectedPaymentCategoryCode")?.value;

  if (selectedCatId) payload.category_id = Number(selectedCatId);
  if (selectedCatCode) payload.category_code = selectedCatCode;

  const token = localStorage.getItem("token");

  try {
    const res = await fetchWithAuth(`${BaseUrl}/api/account/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res) return null;
    const json = await res.json().catch(() => null);
    if (res.ok) {
      // success
      return json?.data || json;
    }
    // handle known server error codes in response body
    const code = json?.message || json?.error || null;
    switch (code) {
      case "YOU_HAVE_PENDING_TRANSACTION":
        return "YOU_HAVE_PENDING_TRANSACTION";
      case "FAILD_TO_GET_QR":
        return "FAILD_TO_GET_QR";
      case "NETWORK_ERROR":
        return "NETWORK_ERROR";
      case "WRONG_PAYMENT_METHOD":
        return "WRONG_PAYMENT_METHOD";
      case "BANK_NOT_SUPPORTED":
        return "BANK_NOT_SUPPORTED";
      default:
        console.error("Deposit failed", res.status, json);
        return null;
    }
  } catch (e) {
    console.error("Deposit request error", e);
    return null;
  }
}

async function APIGetCompanyBanks() {
  const BaseUrl = await fetchBaseURL();

  try {
    const res = await fetchWithAuth(`${BaseUrl}/api/bank/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        accept: "application/json",
      },
    });
    if (!res) return null;
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

APIGetCompanyBanks();

function renderBanksList(banks) {
  const dropdownMenu = document.getElementById("bankDropdownMenu");

  // Clear existing items
  dropdownMenu.innerHTML = "";

  // Render each bank
  banks.forEach((bank, index) => {
    const bankItem = document.createElement("div");
    bankItem.className = "dropdown-item1" + (index === 0 ? " selected" : "");

    // Adjust these property names based on your actual API response structure
    const bankName = bank.bank_name || bank.bank_name || "";
    const bankCode = bank.code || bank.bankCode || "";
    const bankId = bank.id || bank.id || "";

    bankItem.onclick = function () {
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
    const bankName = firstBank.bank_name || firstBank.bank_name || "";
    const bankCode = firstBank.id || firstBank.id || "";

    const trigger = document.getElementById("ddlBank1");
    const label = trigger.querySelector(
      ".dropdown-label .white-space-normal div"
    );
    label.innerHTML = `${bankName} <span style="color: #94a3b8;" id="${bankCode}"></span>`;
  }
}

function selectBankOption(element, bankName, bankCode, bankId) {
  // Update the trigger text
  const trigger = document.getElementById("ddlBank1");
  const label = trigger.querySelector(
    ".dropdown-label .white-space-normal div"
  );
  label.innerHTML = `${bankName} <span style="color: #94a3b8;" id="${bankCode}"></span>`;

  // Remove selected class from all items
  const items = document.querySelectorAll("#bankDropdownMenu .dropdown-item1");
  items.forEach((item) => item.classList.remove("selected"));

  // Add selected class to clicked item
  element.classList.add("selected");

  // Store selected bank id into hidden input (do NOT use localStorage)
  const selectedBankInput = document.getElementById("selectedBankId");
  if (selectedBankInput) selectedBankInput.value = bankId;
  console.log("Selected Bank:", { bankName, bankCode, bankId });

  // You can store it in a hidden input or variable for form submission
  // document.getElementById('selectedBankId').value = bankId;

  // Close dropdown
  toggleBankDropdown();
  // render payment methods for this bank
  try {
    renderPaymentMethodsForBank(bankId);
  } catch (e) {
    /* ignore */
  }
}

// Wire up create-deposit button to use DOM values (no localStorage)
document.addEventListener("DOMContentLoaded", function () {
  const btn = document.getElementById("btnCreateDeposit");
  if (!btn) return;
  btn.addEventListener("click", async function (ev) {
    ev.preventDefault();
    const amountRaw = document.getElementById("inp_vnd_amount1")?.value;
    const amount = parseFloat(amountRaw) || 0;
    const bankId = document.getElementById("selectedBankId")?.value || null;
    const paymentMethod =
      document.getElementById("selectedPaymentMethod")?.value || null;
    const paymentCode =
      document.getElementById("selectedPaymentCode")?.value || null;

    if (!amount || !bankId || !paymentMethod || !paymentCode) {
      alert("Please select bank, payment method and enter an amount");
      return;
    }

    btn.disabled = true;
    const result = await APIMakeDepositRequest(
      amount,
      bankId,
      paymentMethod,
      paymentCode
    );
    btn.disabled = false;

    if (!result) {
      alert("Deposit failed. Check console for details.");
      return;
    }
    if (result === "YOU_HAVE_PENDING_TRANSACTION") {
      alert("You have a pending transaction.");
      return;
    }
    if (result === "FAILD_TO_GET_QR") {
      alert("Failed to get QR.");
      return;
    }
    // success path: server returns data object
    console.log("Deposit response", result);
    // if backend instructs redirect to payment_url, show iframe
    const data = result?.data || result;
    if (data && data.is_redirect && data.payment_url) {
      showPaymentIframe(data.payment_url);
      return;
    }
    alert("Deposit created successfully");
  });
});

// Show payment iframe and hide deposit form
function showPaymentIframe(url) {
  const form = document.querySelector("form.deposit-form");
  if (!form) return;
  // hide the form
  form.style.display = "none";

  // create container if not exists
  let container = document.getElementById("paymentIframeContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "paymentIframeContainer";
    container.style.padding = "12px";
    container.style.background = "#fff";
    container.style.border = "1px solid #e5e7eb";
    container.style.borderRadius = "6px";
    // back button
    const back = document.createElement("button");
    back.type = "button";
    back.textContent = "Back to form";
    back.className = "p-button p-component";
    back.style.marginBottom = "8px";
    back.onclick = hidePaymentIframe;
    container.appendChild(back);

    const iframe = document.createElement("iframe");
    iframe.id = "paymentIframe";
    iframe.src = url;
    iframe.style.width = "100%";
    iframe.style.height = "720px";
    iframe.style.border = "none";
    container.appendChild(iframe);

    form.parentNode.insertBefore(container, form.nextSibling);
  } else {
    // replace iframe src
    const iframe = document.getElementById("paymentIframe");
    if (iframe) iframe.src = url;
    container.style.display = "";
  }
}

// Hide iframe and show deposit form
function hidePaymentIframe() {
  const form = document.querySelector("form.deposit-form");
  if (!form) return;
  const container = document.getElementById("paymentIframeContainer");
  if (container) container.style.display = "none";
  form.style.display = "";
}
