const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// Page selectors matching the updated SearchBar component
const SELECTORS = {
  searchInput: '[data-testid="search-input"]',
  searchIcon: '[data-testid="search-icon"]',
  clearButton: '[data-testid="clear-button"]',
  dropdownToggle: '[data-testid="dropdown-toggle"]',
  dropdown: '[data-testid="dropdown"]',
  searchResults: '[data-testid="search-result"]',
  highlightedResult: '[data-testid="search-result"].highlighted',
  highlightText: 'mark',
  loadingSpinner: '[data-testid="loading-spinner"]',
  errorMessage: '[data-testid="error-message"]',
  noResults: '[data-testid="no-results"]'
};

// Background steps
Given('I am on the search application page', async function() {
  await this.navigateToApp();
  // Wait for the app to fully load
  await this.page.waitForSelector(SELECTORS.searchInput, { timeout: 10000 });
});

Given('the SearchBar is visible', async function() {
  await expect(this.page.locator(SELECTORS.searchInput)).toBeVisible({ timeout: 5000 });
});

// Basic UI visibility steps
Then('I should see the search input field with placeholder {string}', async function(placeholder) {
  const input = this.page.locator(SELECTORS.searchInput);
  await expect(input).toBeVisible();
  await expect(input).toHaveAttribute('placeholder', placeholder);
});

Then('I should see the search icon', async function() {
  await expect(this.page.locator(SELECTORS.searchIcon)).toBeVisible({ timeout: 3000 });
});

Then('I should see the dropdown toggle button', async function() {
  await expect(this.page.locator(SELECTORS.dropdownToggle)).toBeVisible({ timeout: 3000 });
});

// Input interaction steps
When('I type {string} in the search field', async function(text) {
  const input = this.page.locator(SELECTORS.searchInput);
  await input.click(); // Focus the input first
  await input.fill(text);
  // Trigger input event to ensure React state updates
  await input.dispatchEvent('input');
});

Given('I have typed {string} in the search field', async function(text) {
  const input = this.page.locator(SELECTORS.searchInput);
  await input.click();
  await input.fill(text);
  await input.dispatchEvent('input');
  await this.page.waitForTimeout(100); // Small delay to ensure state update
});

Then('the search field should contain {string}', async function(expectedText) {
  await expect(this.page.locator(SELECTORS.searchInput)).toHaveValue(expectedText);
});

Then('the search field should be empty', async function() {
  await expect(this.page.locator(SELECTORS.searchInput)).toHaveValue('');
});

// Clear button steps
Then('the clear button should be visible', async function() {
  // Wait for the clear button to appear after typing
  await expect(this.page.locator(SELECTORS.clearButton)).toBeVisible({ timeout: 2000 });
});

When('I click the clear button', async function() {
  const clearButton = this.page.locator(SELECTORS.clearButton);
  await expect(clearButton).toBeVisible();
  await clearButton.click();
});

Then('the search field should be focused', async function() {
  await expect(this.page.locator(SELECTORS.searchInput)).toBeFocused();
});

// Dropdown interaction steps
Then('the dropdown should be open', async function() {
  await expect(this.page.locator(SELECTORS.dropdown)).toBeVisible({ timeout: 3000 });
});

Then('the dropdown should be closed', async function() {
  await this.page.waitForSelector('[data-testid="dropdown"]', { 
    state: 'hidden',
    timeout: 10000 
  });
});

Given('the dropdown is open', async function() {
  // Ensure dropdown is open by typing something first if needed
  const input = this.page.locator(SELECTORS.searchInput);
  const currentValue = await input.inputValue();
  if (!currentValue) {
    await input.fill('test');
    await input.dispatchEvent('input');
  }
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(500);
  await expect(this.page.locator(SELECTORS.dropdown)).toBeVisible({ timeout: 3000 });
});

// API and results steps
When('I wait for {int} milliseconds', async function(ms) {
  await this.page.waitForTimeout(ms);
});

Then('an API call should be made with query {string}', async function(query) {
  let apiCalled = false;
  let capturedQuery = null;
  
  // Set up the route interceptor BEFORE making the API call
  await this.page.route('http://localhost:5001/api/items*', (route, request) => {
    const url = request.url();
    console.log('🔍 Intercepted API call to:', url);
    
    // Parse query parameters from the URL
    const urlObj = new URL(url);
    const qParam = urlObj.searchParams.get('q');
    console.log('📝 Query parameter "q":', qParam);
    
    if (qParam && qParam.toLowerCase().includes(query.toLowerCase())) {
      apiCalled = true;
      capturedQuery = qParam;
      console.log('✅ API call matched expected query:', query);
      
      // Fulfill the request with mock data
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: `${query} result 1` },
          { id: 2, name: `${query} result 2` }
        ])
      });
    } else {
      console.log('❌ API call did not match expected query. Expected:', query, 'Got:', qParam);
      // Still fulfill to avoid hanging
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }
  });
  
  // Now trigger the API call by typing in the search field
  const input = this.page.locator(SELECTORS.searchInput);
  await input.clear();
  await input.fill(query);
  await input.dispatchEvent('input');
  
  // Wait for debounce timeout (300ms) plus buffer for API call
  await this.page.waitForTimeout(600);
  
  console.log('🎯 Final result - API called:', apiCalled, 'with query:', capturedQuery);
  
  // Clean up the route
  await this.page.unroute('http://localhost:5001/api/items*');
  
  // Assert that API was called
  expect(apiCalled).toBeTruthy();
});

Given('search results are displayed', async function() {
  // Set up mock API response for the Flask backend endpoint
  await this.page.route('http://localhost:5001/api/items*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Test Item 1' },
        { id: 2, name: 'Test Item 2' },
        { id: 3, name: 'Test Item 3' }
      ])
    });
  });
  
  // Type something to trigger the API call
  const input = this.page.locator(SELECTORS.searchInput);
  const currentValue = await input.inputValue();
  if (!currentValue) {
    await input.fill('test');
    await input.dispatchEvent('input');
  }
  
  // Wait for results to appear
  await this.page.waitForTimeout(600); // Wait for debounce + API response
  
  // Check for results
  const results = this.page.locator(SELECTORS.searchResults);
  await expect(results.first()).toBeVisible({ timeout: 3000 });
  const count = await results.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

Given('search results containing {string} are displayed', async function(text) {
  await this.page.route('http://localhost:5001/api/items*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: `${text} item 1` },
        { id: 2, name: `Another ${text}` }
      ])
    });
  });
  
  // Trigger the search
  const input = this.page.locator(SELECTORS.searchInput);
  await input.fill(text);
  await input.dispatchEvent('input');
  
  await this.page.waitForTimeout(600);
});

Then('search results should be displayed', async function() {
  const results = this.page.locator(SELECTORS.searchResults);
  await expect(results.first()).toBeVisible({ timeout: 3000 });
  const count = await results.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

// Keyboard navigation steps
When('I press the {string} key', async function(key) {
  await this.page.locator(SELECTORS.searchInput).press(key);
});

When('I press the {string} key again', async function(key) {
  await this.page.locator(SELECTORS.searchInput).press(key);
});

Then('the first result should be highlighted', async function() {
  const firstResult = this.page.locator(SELECTORS.searchResults).first();
  await expect(firstResult).toHaveClass(/highlighted|bg-gray-200/);
});

Then('the second result should be highlighted', async function() {
  const secondResult = this.page.locator(SELECTORS.searchResults).nth(1);
  await expect(secondResult).toHaveClass(/highlighted|bg-gray-200/);
});

// Result selection steps
When('I click on the first search result', async function() {
  const firstResult = this.page.locator(SELECTORS.searchResults).first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();
});

Then('the selected result should be populated in the search field', async function() {
  // Wait a moment for the selection to update the input
  await this.page.waitForTimeout(200);
  
  // Check that the input field is not empty (has some result text)
  const inputValue = await this.page.locator(SELECTORS.searchInput).inputValue();
  expect(inputValue.length).toBeGreaterThan(0);
});

// Outside click steps
When('I click outside the search component', async function() {
  // Click on the body element, away from the search component
  await this.page.click('body', { 
    position: { x: 50, y: 50 },
    force: true 
  });
});

// Text highlighting steps
Then('the text {string} should be highlighted in the results', async function(text) {
  const highlightedElements = this.page.locator(SELECTORS.highlightText);
  
  // Wait for highlights to appear
  await expect(highlightedElements.first()).toBeVisible({ timeout: 3000 });
  
  const count = await highlightedElements.count();
  expect(count).toBeGreaterThan(0);
  
  // Check if any highlighted element contains our search text
  let foundHighlight = false;
  for (let i = 0; i < count; i++) {
    const highlightedText = await highlightedElements.nth(i).textContent();
    if (highlightedText && highlightedText.toLowerCase().includes(text.toLowerCase())) {
      foundHighlight = true;
      break;
    }
  }
  
  expect(foundHighlight).toBeTruthy();
});