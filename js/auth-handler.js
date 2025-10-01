// Global authentication handler
(function() {
  // Global logout function
  async function logout() {
    const API_BASE_URL = await fetchBaseURL();
    const token = localStorage.getItem("token");
    
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("initialDeposit");
    
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.href = "/";
  }

  // Global 401 handler
  function handle401Response() {
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    logout();
  }

  // Override fetch to handle 401 globally
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 401) {
      handle401Response();
    }
    return response;
  };

  // Make logout function globally available
  window.globalLogout = logout;
})();