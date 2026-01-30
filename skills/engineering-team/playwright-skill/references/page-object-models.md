# Page Object Models (POM) with Playwright

Use this reference when writing test suites, reusable flows, or any automation where the same pages are used across multiple tests. For one-off scripts (screenshot, single flow), inline code is fine; for reuse and maintainability, prefer POM.

## What POM Is

- **Page Object Model**: Each page or major UI section is a class. The class holds **locators** (where elements are) and **actions** (methods that interact with them).
- **Benefit**: One UI change → update one page object → all tests using it keep working. Selectors live in one place instead of scattered across test files.
- **Separation**: Page objects handle UI interactions; **tests** handle assertions. Do not put `expect()` inside page object methods.

## Playwright POM Basics

- Page object constructor receives Playwright `Page` (from fixture or `browser.newPage()`).
- Define locators as **readonly class properties** so they are created once and reused.
- Expose **methods** for navigation and user actions (`goto()`, `login()`, `fillForm()`).
- Expose **state** for tests to assert on (e.g. `getErrorMessage()`, or expose locators so tests call `expect(locator).toBeVisible()`).

```javascript
// Example: LoginPage as a page object
const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.locator('.error-message');
  }

  async goto(baseUrl) {
    await this.page.goto(`${baseUrl}/login`);
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }
}

// In test: assertions stay in the test
// const loginPage = new LoginPage(page);
// await loginPage.login('bad', 'bad');
// await expect(loginPage.errorMessage).toBeVisible();
```

## Locator Strategy (Resilient Selectors)

Prefer Playwright’s **getBy** methods so selectors survive small UI changes:

1. **getByRole()** – buttons, links, checkboxes, etc. (best for accessibility and stability).
2. **getByLabel()** – form fields by associated label.
3. **getByPlaceholder()** – inputs by placeholder.
4. **getByText()** – non-interactive text.
5. **getByAltText()** – images.
6. **getByTitle()** – title attribute.
7. **getByTestId()** – `data-testid` only when nothing else fits.

Avoid relying on raw CSS (e.g. `.btn-primary`) or XPath for structure that changes often. Use `page.locator()` or `getByTestId()` when you must target a specific attribute.

## Structure for Test Suites

When writing a suite (multiple tests, same app), organize by concern:

```
test-automation/
├── pages/
│   ├── base-page.js      # Optional: shared navigate, click, fill
│   ├── login-page.js
│   └── dashboard-page.js
├── components/
│   └── navigation.js     # Optional: shared header/nav used on many pages
└── tests/
    └── auth.spec.js
```

For scripts written to `/tmp`, you can keep **one file** with page classes at the top and the test flow at the bottom, so the same POM style applies without multiple files.

## Base Page (Optional)

Use a base class for shared behavior (goto, generic click/fill, timeouts) so concrete page objects stay small.

```javascript
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigateTo(url) {
    await this.page.goto(url);
  }

  async getText(locator) {
    return (await this.page.locator(locator).textContent()) || '';
  }
}

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
    // ...
  }
}
```

## Reusable Components

For elements that appear on many pages (nav, modals, cookie banners), use a **component** class that receives `page` (and optionally a root locator).

```javascript
class NavigationComponent {
  constructor(page) {
    this.page = page;
    this.homeLink = page.getByRole('link', { name: 'Home' });
    this.cartIcon = page.getByRole('link', { name: 'Cart' });
  }

  async goToHome() {
    await this.homeLink.click();
  }

  async openCart() {
    await this.cartIcon.click();
  }
}
```

Page objects can then hold a `nav = new NavigationComponent(page)` and delegate, or tests can use the component directly.

## Configuration

Keep base URL and environment-specific values out of page logic. Use a top-level constant or env:

```javascript
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// In page: await this.page.goto(`${BASE_URL}/login`);
```

## When to Use POM vs Inline Scripts

| Use POM when | Use inline / single script when |
|--------------|----------------------------------|
| Multiple tests hit the same pages | One-off run (screenshot, single flow) |
| You want one place to update selectors | Quick exploration or debugging |
| Reusing flows (e.g. login) across tests | Very small or throwaway automation |
| Building a suite that will be maintained | API or non-UI checks |

## Single-File POM in /tmp

When writing to `/tmp`, you can still use POM in one file: define page classes at the top, then the main script that creates browser/page, instantiates page objects, and runs the flow (and assertions in the script, not in the page class).

## Official and Further Reading

- [Playwright: Page object models](https://playwright.dev/docs/pom) – official POM guide and examples.
- [Playwright: Locators](https://playwright.dev/docs/locators) – getBy role, label, text, testId, etc.
