// Base URL configuration
async function fetchBaseURL() {
  // You can modify this to match your actual API base URL
  return "https://api.alo789.com/api" || "http://localhost:8000/api";
}

// Make function globally available
window.fetchBaseURL = fetchBaseURL;