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
    
    // Clear all localStorage
    localStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Redirect to login
    window.location.replace('./index.html');
  }

  // Global 401 handler
  function handle401Response() {
    // Clear all storage immediately
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    
    alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    window.location.replace('./index.html');
  }

  // Override fetch to handle 401 globally
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 401) {
      handle401Response();
      return null;
    }
    return response;
  };

  // Make logout function globally available
  window.globalLogout = logout;
})();