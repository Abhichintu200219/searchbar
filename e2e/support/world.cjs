const { setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

class CustomWorld {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
  }

  async openBrowser() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true' || process.env.CI === 'true',
      slowMo: process.env.CI ? 0 : 500// Slow down actions for better visibility
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    // Add debugging listeners for API calls
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });
    
    // Log network requests for debugging API calls
    this.page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('API Request:', request.method(), request.url());
      }
    });
    
    this.page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log('API Response:', response.status(), response.url());
      }
    });
  }

  async closeBrowser() {
    if (this.page) {
      // Clean up any route interceptors before closing
      await this.page.unrouteAll();
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async navigateToApp() {
    await this.page.goto('http://localhost:4173');
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait a bit more to ensure React app is fully loaded
    await this.page.waitForTimeout(1000);
  }
}

setWorldConstructor(CustomWorld);

// Setup and teardown hooks
Before(async function() {
  console.log('Setting up browser for test...');
  await this.openBrowser();
});

After(async function() {
  console.log('Cleaning up browser after test...');
  await this.closeBrowser();
});