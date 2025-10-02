// Delete bank account API
async function deleteBankAccount(bankId) {
  const API_BASE_URL = await fetchBaseURL();
  const token = localStorage.getItem("token");

  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/bank/delete_user_bank/${bankId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    if (!response) {
      return {
        success: false,
        message: "Authentication failed. Please login again.",
      };
    }

    const result = await response.json();

    if (response.ok && result.status) {
      return {
        success: true,
        message: "Tài khoản ngân hàng đã được xóa thành công!",
        data: result,
      };
    } else {
      return {
        success: false,
        message: result.message || "Có lỗi xảy ra khi xóa tài khoản ngân hàng",
        data: result,
      };
    }
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi kết nối với máy chủ",
      error: error,
    };
  }
}

// Delete bank with confirmation
async function confirmDeleteBank(bankId, bankName) {
  if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ngân hàng ${bankName}?`)) {
    const deleteBtn = document.querySelector(`[data-bank-id="${bankId}"]`);
    if (deleteBtn) {
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = '<i class="pi pi-spin pi-spinner"></i>';
    }

    try {
      const result = await deleteBankAccount(bankId);

      if (result.success) {
        alert(result.message);
        // Refresh bank list
        if (window.displayBanks) {
          await window.displayBanks();
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra khi xóa tài khoản");
    } finally {
      if (deleteBtn) {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '<i class="pi pi-trash"></i>';
      }
    }
  }
}

// Make function globally available
window.confirmDeleteBank = confirmDeleteBank;
window.deleteBankAccount = deleteBankAccount;
