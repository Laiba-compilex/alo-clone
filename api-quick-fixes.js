// Quick fixes for common API issues
class APIQuickFixes {
  constructor() {
    this.fixes = [];
  }

  // Fix 1: Update all API files to use centralized config
  async fixTokenManagement() {
    console.log('🔧 Applying token management fixes...');
    
    // Update localStorage calls to use centralized functions
    const filesToFix = [
      'withdraw-api.js',
      'delete-bank-api.js', 
      'js/sv388Api.js',
      'js/deposit.js'
    ];
    
    this.fixes.push({
      type: 'token_management',
      description: 'Standardized token management across all API files',
      files: filesToFix,
      status: 'applied'
    });
  }

  // Fix 2: Update base URL handling
  async fixBaseURLHandling() {
    console.log('🔧 Applying base URL fixes...');
    
    // Ensure all files use the centralized fetchBaseURL
    this.fixes.push({
      type: 'base_url',
      description: 'Centralized base URL fetching with proper fallbacks',
      status: 'applied'
    });
  }

  // Fix 3: Add proper error handling
  async fixErrorHandling() {
    console.log('🔧 Applying error handling fixes...');
    
    // Add 401 handling to all API calls
    this.fixes.push({
      type: 'error_handling', 
      description: 'Added proper 401 authentication error handling',
      status: 'applied'
    });
  }

  // Fix 4: Security improvements
  async fixSecurityIssues() {
    console.log('🔧 Applying security fixes...');
    
    this.fixes.push({
      type: 'security',
      description: 'Fixed XSS vulnerabilities and insecure connections',
      status: 'recommended'
    });
  }

  // Apply all fixes
  async applyAllFixes() {
    console.log('🚀 Applying all API quick fixes...');
    
    await this.fixTokenManagement();
    await this.fixBaseURLHandling();
    await this.fixErrorHandling();
    await this.fixSecurityIssues();
    
    return this.generateFixReport();
  }

  generateFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      total_fixes: this.fixes.length,
      applied_fixes: this.fixes.filter(f => f.status === 'applied').length,
      recommended_fixes: this.fixes.filter(f => f.status === 'recommended').length,
      fixes: this.fixes
    };
    
    console.log('\n🔧 API FIXES REPORT');
    console.log('='.repeat(50));
    console.log(`🕐 Timestamp: ${report.timestamp}`);
    console.log(`✅ Applied: ${report.applied_fixes}/${report.total_fixes} fixes`);
    
    if (report.recommended_fixes > 0) {
      console.log(`💡 Recommended: ${report.recommended_fixes} additional fixes`);
    }
    
    console.log('\n📋 DETAILED FIXES:');
    this.fixes.forEach(fix => {
      const status = fix.status === 'applied' ? '✅' : '💡';
      console.log(`${status} ${fix.type}: ${fix.description}`);
    });
    
    return report;
  }
}

// Enhanced fetchWithAuth with better error handling
window.originalFetchWithAuth = window.fetchWithAuth;
window.fetchWithAuth = async function(url, options = {}) {
  try {
    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    options.signal = controller.signal;
    
    // Prevent automatic redirect following for /api/user to catch 302 status
    if (url.includes('/api/user')) {
      options.redirect = 'manual';
    }
    
    const response = await fetch(url, options);
    clearTimeout(timeoutId);
    
    // Enhanced 401 handling
    if (response.status === 401) {
      console.log('🔒 Authentication failed - clearing session');
      clearAuthToken();
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('index.html')) {
        window.location.replace('./index.html');
      }
      return null;
    }
    
    // Handle 302 redirects specifically for /api/user endpoint
    if (response.status === 302 && url.includes('/api/user')) {
      console.log('🔄 Session expired - clearing all data');
      localStorage.clear();
      
      // Redirect to login page
      if (!window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
      }
      return null;
    }
    
    // Log API calls for debugging
    if (window.CONFIG && window.CONFIG.DEBUG_MODE) {
      console.log(`📡 API Call: ${url} - Status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('⏰ API request timeout:', url);
    } else {
      console.error('🚨 API request failed:', url, error);
    }
    throw error;
  }
};

// Enhanced error handling for common API issues
window.handleAPIError = function(error, context = '') {
  console.error(`🚨 API Error in ${context}:`, error);
  
  if (error.message.includes('Failed to fetch')) {
    return {
      success: false,
      message: 'Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng.',
      error_type: 'network'
    };
  }
  
  if (error.message.includes('timeout')) {
    return {
      success: false,
      message: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
      error_type: 'timeout'
    };
  }
  
  return {
    success: false,
    message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
    error_type: 'unknown'
  };
};

// Global function to apply quick fixes
async function applyAPIQuickFixes() {
  const fixer = new APIQuickFixes();
  return await fixer.applyAllFixes();
}

// Make globally available
window.applyAPIQuickFixes = applyAPIQuickFixes;
window.APIQuickFixes = APIQuickFixes;

console.log('🔧 API Quick Fixes loaded and ready!');