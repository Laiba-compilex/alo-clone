// API Status Checker - Comprehensive API health monitoring
class APIStatusChecker {
  constructor() {
    this.endpoints = [
      // Base URL endpoints
      {
        name: "CDN Tracker (Primary)",
        url: "https://cdntracker0019.com?site_code=gavn138",
        type: "base_url",
        critical: true,
      },
      {
        name: "CDN Tracker (Staging)",
        url: "https://cdntracker0019.com?site_code=gavn138",
        type: "base_url",
        critical: false,
      },
      {
        name: "Fallback Base URL",
        url: "https://bo.gagavn138.com",
        type: "base_url",
        critical: true,
      },

      // Authentication endpoints
      {
        name: "User Login",
        url: "/api/login_user",
        type: "auth",
        method: "POST",
        requiresAuth: false,
        critical: true,
      },
      {
        name: "User Registration",
        url: "/api/register_user",
        type: "auth",
        method: "POST",
        requiresAuth: false,
        critical: true,
      },
      {
        name: "User Profile",
        url: "/api/user",
        type: "auth",
        method: "GET",
        requiresAuth: true,
        critical: true,
      },

      // Banking endpoints
      {
        name: "Add Bank Account",
        url: "/bank/add_user_bank",
        type: "banking",
        method: "POST",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Delete Bank Account",
        url: "/bank/delete_user_bank",
        type: "banking",
        method: "DELETE",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Get User Banks",
        url: "/player/active/banks",
        type: "banking",
        method: "GET",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Get Bank Codes",
        url: "/api/bankcodes/all",
        type: "banking",
        method: "GET",
        requiresAuth: true,
        critical: false,
      },

      // Transaction endpoints
      {
        name: "Withdraw Request",
        url: "/account/withdraw",
        type: "transaction",
        method: "POST",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Deposit Request",
        url: "/api/account/deposit",
        type: "transaction",
        method: "POST",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Payment Categories",
        url: "/api/bank/get_payment_category_details",
        type: "transaction",
        method: "GET",
        requiresAuth: true,
        critical: true,
      },

      // Game endpoints
      {
        name: "Game Categories",
        url: "/api/player/game_categories",
        type: "game",
        method: "GET",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Game Login",
        url: "/api/player/game/login",
        type: "game",
        method: "POST",
        requiresAuth: true,
        critical: true,
      },
      {
        name: "Seamless Withdraw",
        url: "/api/player/points/withdraw/seamless",
        type: "game",
        method: "POST",
        requiresAuth: true,
        critical: false,
      },
    ];

    this.results = [];
    this.baseUrl = null;
  }

  async checkBaseURL() {
    console.log("🔍 Checking base URL endpoints...");

    for (const endpoint of this.endpoints.filter(
      (e) => e.type === "base_url"
    )) {
      try {
        const response = await fetch(endpoint.url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();
        const isWorking =
          response.ok &&
          (data.url || endpoint.url.includes("bo.gagavn138.com"));

        this.results.push({
          ...endpoint,
          status: isWorking ? "working" : "failed",
          statusCode: response.status,
          responseTime: Date.now(),
          data: data,
        });

        if (isWorking && !this.baseUrl) {
          this.baseUrl = data.url || endpoint.url;
        }
      } catch (error) {
        this.results.push({
          ...endpoint,
          status: "error",
          error: error.message,
        });
      }
    }

    if (!this.baseUrl) {
      this.baseUrl = "https://bo.gagavn138.com"; // Final fallback
    }

    console.log(`✅ Base URL determined: ${this.baseUrl}`);
  }

  async checkAPIEndpoint(endpoint) {
    if (!this.baseUrl) {
      throw new Error("Base URL not available");
    }

    const fullUrl = this.baseUrl + endpoint.url;
    const token = getAuthToken();

    try {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      if (endpoint.requiresAuth && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const options = {
        method: endpoint.method || "GET",
        headers: headers,
      };

      // Add test data for POST requests
      if (endpoint.method === "POST") {
        if (endpoint.url.includes("login_user")) {
          options.body = JSON.stringify({
            phone: "test_phone",
            password: "test_password",
          });
        } else if (endpoint.url.includes("register_user")) {
          options.body = JSON.stringify({
            phone: "test_phone",
            password: "test_password",
          });
        } else {
          // For other POST endpoints, just check if they respond to OPTIONS
          options.method = "OPTIONS";
        }
      }

      const startTime = Date.now();
      const response = await fetch(fullUrl, options);
      const responseTime = Date.now() - startTime;

      let data = null;
      try {
        data = await response.json();
      } catch (e) {
        // Response might not be JSON
      }

      const isWorking = response.status < 500; // Consider 4xx as working (just auth/validation issues)

      return {
        ...endpoint,
        status: isWorking ? "working" : "failed",
        statusCode: response.status,
        responseTime: responseTime,
        data: data,
        fullUrl: fullUrl,
      };
    } catch (error) {
      return {
        ...endpoint,
        status: "error",
        error: error.message,
        fullUrl: fullUrl,
      };
    }
  }

  async checkAllAPIs() {
    console.log("🚀 Starting comprehensive API status check...");

    // First check base URLs
    await this.checkBaseURL();

    // Then check all other endpoints
    const apiEndpoints = this.endpoints.filter((e) => e.type !== "base_url");

    console.log(`🔍 Checking ${apiEndpoints.length} API endpoints...`);

    for (const endpoint of apiEndpoints) {
      const result = await this.checkAPIEndpoint(endpoint);
      this.results.push(result);

      // Add small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return this.generateReport();
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        total: this.results.length,
        working: this.results.filter((r) => r.status === "working").length,
        failed: this.results.filter((r) => r.status === "failed").length,
        errors: this.results.filter((r) => r.status === "error").length,
      },
      critical_issues: this.results.filter(
        (r) => r.critical && r.status !== "working"
      ),
      results: this.results,
    };

    // Group results by type
    report.by_type = {
      base_url: this.results.filter((r) => r.type === "base_url"),
      auth: this.results.filter((r) => r.type === "auth"),
      banking: this.results.filter((r) => r.type === "banking"),
      transaction: this.results.filter((r) => r.type === "transaction"),
      game: this.results.filter((r) => r.type === "game"),
    };

    return report;
  }

  displayReport(report) {
    console.log("\n📊 API STATUS REPORT");
    console.log("=".repeat(50));
    console.log(`🕐 Timestamp: ${report.timestamp}`);
    console.log(`🌐 Base URL: ${report.baseUrl}`);
    console.log(
      `📈 Summary: ${report.summary.working}/${report.summary.total} working`
    );

    if (report.critical_issues.length > 0) {
      console.log("\n🚨 CRITICAL ISSUES:");
      report.critical_issues.forEach((issue) => {
        console.log(
          `❌ ${issue.name}: ${issue.status} (${
            issue.statusCode || issue.error
          })`
        );
      });
    }

    console.log("\n📋 DETAILED RESULTS:");
    Object.entries(report.by_type).forEach(([type, results]) => {
      console.log(`\n${type.toUpperCase()}:`);
      results.forEach((result) => {
        const status =
          result.status === "working"
            ? "✅"
            : result.status === "failed"
            ? "❌"
            : "⚠️";
        const details = result.statusCode
          ? `(${result.statusCode})`
          : result.error
          ? `(${result.error})`
          : "";
        console.log(`  ${status} ${result.name} ${details}`);
      });
    });

    return report;
  }
}

// Global function to check API status
async function checkAPIStatus() {
  const checker = new APIStatusChecker();
  const report = await checker.checkAllAPIs();
  return checker.displayReport(report);
}

// Auto-check on page load if token exists
document.addEventListener("DOMContentLoaded", function () {
  // Only auto-check if user is logged in
  if (getAuthToken()) {
    console.log("🔍 Auto-checking API status...");
    checkAPIStatus().catch(console.error);
  }
});

// Make globally available
window.checkAPIStatus = checkAPIStatus;
window.APIStatusChecker = APIStatusChecker;
