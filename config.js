// Centralized configuration
const CONFIG = {
  SITE_CODE: 'gavn138', // or 'staging' - choose one
  CDN_TRACKER_URL: 'https://cdntracker0019.com',
  FALLBACK_BASE_URL: 'https://bo.gagavn138.com',
  TOKEN_KEY: 'auth_token' // Standardize token key
};

// Centralized base URL fetching
async function fetchBaseURL() {
  try {
    const response = await fetch(`${CONFIG.CDN_TRACKER_URL}?site_code=${CONFIG.SITE_CODE}`);
    const data = await response.json();
    
    if (response.ok && data.url) {
      return data.url;
    } else {
      throw new Error('Invalid response for base URL');
    }
  } catch (error) {
    console.error('Error fetching base URL:', error);
    return CONFIG.FALLBACK_BASE_URL;
  }
}

// Centralized token management
function getAuthToken() {
  return localStorage.getItem(CONFIG.TOKEN_KEY);
}

function setAuthToken(token) {
  localStorage.setItem(CONFIG.TOKEN_KEY, token);
}

function clearAuthToken() {
  localStorage.removeItem(CONFIG.TOKEN_KEY);
}

// Make globally available
window.CONFIG = CONFIG;
window.fetchBaseURL = fetchBaseURL;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.clearAuthToken = clearAuthToken;