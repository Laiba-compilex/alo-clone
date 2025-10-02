// Simple test function for add bank API
async function testAddBank() {
  console.log("Testing add bank API...");
  
  // Test data
  const testData = {
    bankName: "VIETCOMBANK",
    accountNumber: "1234567890",
    accountHolder: "NGUYEN VAN A"
  };
  
  try {
    const result = await addBankAccount(
      testData.bankName, 
      testData.accountNumber, 
      testData.accountHolder
    );
    
    console.log("Test result:", result);
    
    if (result.success) {
      alert("Test successful: " + result.message);
    } else {
      alert("Test failed: " + result.message);
    }
  } catch (error) {
    console.error("Test error:", error);
    alert("Test error: " + error.message);
  }
}

// Add test button to page
document.addEventListener("DOMContentLoaded", function() {
  // Only add test button if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Add Bank API';
    testBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: red; color: white; padding: 10px;';
    testBtn.onclick = testAddBank;
    document.body.appendChild(testBtn);
  }
});