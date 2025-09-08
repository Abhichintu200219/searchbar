Feature: SearchBar Functionality
  As a user
  I want to search for items using the SearchBar
  So that I can find relevant results quickly

  Background:
    Given I am on the search application page
    And the SearchBar is visible

  Scenario: User can see the search input field
    Then I should see the search input field with placeholder "Search..."
    And I should see the search icon
    And I should see the dropdown toggle button

  Scenario: User types in search field
    When I type "apple" in the search field
    Then the search field should contain "apple"
    And the clear button should be visible
    And the dropdown should be open

  Scenario: Search triggers API call with debounce
    When I type "test" in the search field
    And I wait for 400 milliseconds
    Then an API call should be made with query "test"
    And search results should be displayed

  Scenario: User can navigate search results with keyboard
    Given I have typed "item" in the search field
    And search results are displayed
    When I press the "ArrowDown" key
    Then the first result should be highlighted
    When I press the "ArrowDown" key again
    Then the second result should be highlighted

  Scenario: User can select result with Enter key
    Given I have typed "test" in the search field
    And search results are displayed
    When I press the "ArrowDown" key
    And I press the "Enter" key
    Then the selected result should be populated in the search field
    And the dropdown should be closed

  Scenario: User can select result by clicking
    Given I have typed "item" in the search field
    And search results are displayed
    When I click on the first search result
    Then the selected result should be populated in the search field
    And the dropdown should be closed

  Scenario: User can clear the search field
    Given I have typed "apple" in the search field
    When I click the clear button
    Then the search field should be empty
    And the dropdown should be closed
    And the search field should be focused

  Scenario: User can close dropdown with Escape key
    Given I have typed "test" in the search field
    And the dropdown is open
    When I press the "Escape" key
    Then the dropdown should be closed

  Scenario: Clicking outside closes the dropdown
    Given I have typed "test" in the search field
    And the dropdown is open
    When I click outside the search component
    Then the dropdown should be closed

  Scenario: Search highlights matching text in results
    Given I have typed "app" in the search field
    And search results containing "apple" are displayed
    Then the text "app" should be highlighted in the results