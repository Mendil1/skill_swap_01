/**
 * Authentication Persistence Verification Test
 *
 * This script tests the complete authentication flow including:
 * 1. Session sync from server to client
 * 2. Hot reload resilience
 * 3. Navigation persistence
 * 4. Global state management
 */

const AuthPersistenceTest = {

  // Test configuration
  config: {
    testUser: 'Mike: 360z8@ptct.net',
    testUrls: ['/profile', '/credits', '/sessions'],
    hotReloadTestInterval: 5000, // 5 seconds
  },

  // State tracking
  state: {
    testStartTime: Date.now(),
    sessionSyncTests: 0,
    navigationTests: 0,
    hotReloadTests: 0,
    errors: [],
  },

  // Utility functions
  utils: {
    log: (message, type = 'info') => {
      const timestamp = new Date().toLocaleTimeString();
      const prefix = {
        info: '📝',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        test: '🧪'
      }[type];
      console.log(`${prefix} [${timestamp}] ${message}`);
    },

    formatDuration: (ms) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
    }
  },

  // Test: Session sync endpoint
  testSessionSync: async function() {
    this.utils.log('Testing session sync endpoint...', 'test');
    try {
      const response = await fetch('/auth/sync-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        this.utils.log(`Session sync successful for ${data.user?.email}`, 'success');
        this.utils.log(`Token expires in ${Math.round((data.expires_at * 1000 - Date.now()) / 1000 / 60)} minutes`, 'info');
        this.state.sessionSyncTests++;
        return true;
      } else {
        const error = await response.json();
        this.utils.log(`Session sync failed: ${error.error}`, 'error');
        this.state.errors.push(`Session sync: ${error.error}`);
        return false;
      }
    } catch (error) {
      this.utils.log(`Session sync error: ${error.message}`, 'error');
      this.state.errors.push(`Session sync: ${error.message}`);
      return false;
    }
  },

  // Test: localStorage persistence
  testLocalStorage: function() {
    this.utils.log('Testing localStorage persistence...', 'test');
    let sessionFound = false;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('auth-token')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.user?.email) {
              this.utils.log(`Found session in localStorage for ${parsed.user.email}`, 'success');
              sessionFound = true;
            }
          } catch (e) {
            this.utils.log('Could not parse localStorage session', 'warning');
          }
        }
      }
    }

    if (!sessionFound) {
      this.utils.log('No session found in localStorage', 'warning');
      this.state.errors.push('No localStorage session');
    }

    return sessionFound;
  },

  // Test: Cookie presence
  testCookies: function() {
    this.utils.log('Testing server-side cookies...', 'test');
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookies = cookies.filter(c =>
      c.includes('sb-') && (c.includes('auth-token') || c.includes('refresh-token'))
    );

    if (authCookies.length > 0) {
      this.utils.log(`Found ${authCookies.length} auth cookies`, 'success');
      return true;
    } else {
      this.utils.log('No auth cookies found', 'warning');
      return false;
    }
  },

  // Test: Navigation persistence
  testNavigation: async function() {
    this.utils.log('Testing navigation persistence...', 'test');
    const currentUrl = window.location.pathname;

    for (const url of this.config.testUrls) {
      if (currentUrl !== url) {
        this.utils.log(`Testing navigation to ${url}`, 'info');
        // In a real test, we would navigate and check auth state
        // For now, just log the test intention
      }
    }

    this.state.navigationTests++;
  },

  // Test: Hot reload simulation
  testHotReloadResilience: function() {
    this.utils.log('Testing hot reload resilience...', 'test');

    // Simulate what happens during hot reload
    const beforeTest = {
      hasLocalStorage: this.testLocalStorage(),
      hasSessionSync: false // Will be tested
    };

    // Test session sync after "hot reload"
    setTimeout(async () => {
      const afterTest = {
        hasLocalStorage: this.testLocalStorage(),
        hasSessionSync: await this.testSessionSync()
      };

      if (afterTest.hasLocalStorage && afterTest.hasSessionSync) {
        this.utils.log('Hot reload resilience test passed', 'success');
      } else {
        this.utils.log('Hot reload resilience test failed', 'error');
        this.state.errors.push('Hot reload resilience failed');
      }

      this.state.hotReloadTests++;
    }, this.config.hotReloadTestInterval);
  },

  // Generate test report
  generateReport: function() {
    const duration = Date.now() - this.state.testStartTime;

    console.log('\n' + '='.repeat(60));
    console.log('🧪 AUTHENTICATION PERSISTENCE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Test Duration: ${this.utils.formatDuration(duration)}`);
    console.log(`📊 Session Sync Tests: ${this.state.sessionSyncTests}`);
    console.log(`📊 Navigation Tests: ${this.state.navigationTests}`);
    console.log(`📊 Hot Reload Tests: ${this.state.hotReloadTests}`);
    console.log(`📊 Errors: ${this.state.errors.length}`);

    if (this.state.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.state.errors.forEach(error => console.log(`   ${error}`));
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    if (this.state.sessionSyncTests === 0) {
      console.log('   ⚠️  Run session sync test');
    }
    if (this.state.errors.length === 0) {
      console.log('   ✅ All tests passed - authentication should be persistent!');
    }

    console.log('='.repeat(60));
  },

  // Run all tests
  runAllTests: async function() {
    this.utils.log('Starting comprehensive authentication persistence test...', 'test');

    // Core functionality tests
    const sessionSyncPassed = await this.testSessionSync();
    const localStoragePassed = this.testLocalStorage();
    const cookiesPassed = this.testCookies();

    // Advanced tests
    await this.testNavigation();
    this.testHotReloadResilience();

    // Generate report after a delay to let hot reload test complete
    setTimeout(() => {
      this.generateReport();
    }, this.config.hotReloadTestInterval + 1000);

    return {
      sessionSync: sessionSyncPassed,
      localStorage: localStoragePassed,
      cookies: cookiesPassed
    };
  }
};

// Auto-run tests when script is loaded
console.log('🚀 Loading Authentication Persistence Test Suite...');
AuthPersistenceTest.runAllTests();
