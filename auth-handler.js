// Global 401 handler for authentication
function handle401Error() {
  console.log('handle401Error called - clearing storage and redirecting');
  
  // Clear all localStorage data
  localStorage.clear();
  console.log('localStorage cleared');
  
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('sessionStorage cleared');
  
  // Clear cookies
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
  console.log('cookies cleared');
  
  // Force redirect to index.html
  console.log('redirecting to index.html');
  window.location.replace('./index.html');
}

// Global fetch wrapper with 401 handling
async function fetchWithAuth(url, options = {}) {
  try {
    console.log('fetchWithAuth called:', url, options);
    const response = await fetch(url, options);
    console.log('fetchWithAuth response status:', response.status);
    
    if (response.status === 401) {
      console.log('401 detected, calling handle401Error');
      handle401Error();
      return null;
    }
    
    return response;
  } catch (error) {
    console.error('fetchWithAuth error:', error);
    throw error;
  }
}

// Axios interceptor for 401 handling
function setupAxiosInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        handle401Error();
      }
      return Promise.reject(error);
    }
  );
}

// Make functions globally available
window.handle401Error = handle401Error;
window.fetchWithAuth = fetchWithAuth;
window.setupAxiosInterceptor = setupAxiosInterceptor;