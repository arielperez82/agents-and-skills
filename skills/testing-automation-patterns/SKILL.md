---
name: testing-automation-patterns
description: Testing automation frameworks and patterns including E2E testing with Playwright/Cypress, Vitest configuration, performance optimization, and automation best practices.
---

# Testing Automation Patterns

Comprehensive patterns for automated testing including E2E testing frameworks, performance optimization, configuration best practices, and automation strategies.

## E2E Testing with Playwright & Cypress

### When to Use E2E Testing

- **Critical user journeys**: Login, checkout, signup flows
- **Complex interactions**: Drag-and-drop, multi-step forms
- **Cross-browser compatibility**: Testing across browsers
- **Real API integration**: Full-stack validation
- **Authentication flows**: End-to-end auth validation

### When NOT to Use E2E Testing

- **Unit-level logic**: Use unit tests instead
- **API contracts**: Use integration tests
- **Edge cases**: Too slow for comprehensive edge case testing
- **Internal implementation details**: Test user behavior only

## Playwright Patterns

### Setup and Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"], ["junit", { outputFile: "results.xml" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
```

### Page Object Model Pattern

```typescript
// pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent()) ?? "";
  }
}

// Test using Page Object
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

test("successful login", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("user@example.com", "password123");

  await expect(page).toHaveURL("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
```

### Test Fixtures for Data Management

```typescript
// fixtures/test-data.ts
import { test as base } from "@playwright/test";

type TestData = {
  testUser: {
    email: string;
    password: string;
    name: string;
  };
  adminUser: {
    email: string;
    password: string;
  };
};

export const test = base.extend<TestData>({
  testUser: async ({}, use) => {
    const user = {
      email: `test-${Date.now()}@example.com`,
      password: "Test123!@#",
      name: "Test User",
    };
    // Setup: Create user in database
    await createTestUser(user);
    await use(user);
    // Teardown: Clean up user
    await deleteTestUser(user.email);
  },

  adminUser: async ({}, use) => {
    await use({
      email: "admin@example.com",
      password: process.env.ADMIN_PASSWORD!,
    });
  },
});

// Usage in tests
import { test } from "./fixtures/test-data";

test("user can update profile", async ({ page, testUser }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password").fill(testUser.password);
  await page.getByRole("button", { name: "Login" }).click();

  await page.goto("/profile");
  await page.getByLabel("Name").fill("Updated Name");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText("Profile updated")).toBeVisible();
});
```

### Waiting Strategies (Avoiding Flaky Tests)

```typescript
// ❌ Bad: Fixed timeouts
await page.waitForTimeout(3000); // Flaky!

// ✅ Good: Wait for specific conditions
await page.waitForLoadState("networkidle");
await page.waitForURL("/dashboard");
await page.waitForSelector('[data-testid="user-profile"]');

// ✅ Better: Auto-waiting with assertions
await expect(page.getByText("Welcome")).toBeVisible();
await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();

// Wait for API response
const responsePromise = page.waitForResponse(
  (response) =>
    response.url().includes("/api/users") && response.status() === 200,
);
await page.getByRole("button", { name: "Load Users" }).click();
const response = await responsePromise;
const data = await response.json();
expect(data.users).toHaveLength(10);

// Wait for multiple conditions
await Promise.all([
  page.waitForURL("/success"),
  page.waitForLoadState("networkidle"),
  expect(page.getByText("Payment successful")).toBeVisible(),
]);
```

### Network Mocking and API Interception

```typescript
// Mock API responses
test("displays error when API fails", async ({ page }) => {
  await page.route("**/api/users", (route) => {
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Internal Server Error" }),
    });
  });

  await page.goto("/users");
  await expect(page.getByText("Failed to load users")).toBeVisible();
});

// Modify requests
test("can modify API request", async ({ page }) => {
  await page.route("**/api/users", async (route) => {
    const request = route.request();
    const postData = JSON.parse(request.postData() || "{}");

    // Modify request
    postData.role = "admin";

    await route.continue({
      postData: JSON.stringify(postData),
    });
  });

  // Test continues...
});
```

## Cypress Patterns

### Setup and Configuration

```typescript
// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    setupNodeEvents(on, config) {
      // Implement node event listeners
    },
  },
});
```

### Custom Commands

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      createUser(userData: UserData): Chainable<User>;
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="password"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("createUser", (userData: UserData) => {
  return cy.request("POST", "/api/users", userData).its("body");
});

Cypress.Commands.add("dataCy", (value: string) => {
  return cy.get(`[data-cy="${value}"]`);
});

// Usage
cy.login("user@example.com", "password");
cy.dataCy("submit-button").click();
```

### Cypress Intercept (API Mocking)

```typescript
// Mock API calls
cy.intercept("GET", "/api/users", {
  statusCode: 200,
  body: [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
  ],
}).as("getUsers");

cy.visit("/users");
cy.wait("@getUsers");
cy.get('[data-testid="user-list"]').children().should("have.length", 2);

// Modify responses
cy.intercept("GET", "/api/users", (req) => {
  req.reply((res) => {
    // Modify response
    res.body.users = res.body.users.slice(0, 5);
    res.send();
  });
});

// Simulate slow network
cy.intercept("GET", "/api/data", (req) => {
  req.reply((res) => {
    res.delay(3000); // 3 second delay
    res.send();
  });
});
```

## Vitest Configuration & Patterns

### Configuration Best Practices

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // Re-exports
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

### Test Structure Patterns

```typescript
// src/__tests__/userService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '../userService';
import { apiClient } from '../apiClient';

// Mock external dependencies
vi.mock('../apiClient');

describe('userService', () => {
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    describe('when user exists', () => {
      const mockUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
      };

      beforeEach(() => {
        mockApiClient.get.mockResolvedValue(mockUser);
      });

      it('returns the user', async () => {
        const result = await userService.getUser('123');
        expect(result).toEqual(mockUser);
      });

      it('calls the API with correct parameters', async () => {
        await userService.getUser('123');
        expect(mockApiClient.get).toHaveBeenCalledWith('/users/123');
      });
    });

    describe('when user does not exist', () => {
      beforeEach(() => {
        mockApiClient.get.mockRejectedValue(new Error('User not found'));
      });

      it('throws an error', async () => {
        await expect(userService.getUser('999')).rejects.toThrow('User not found');
      });
    });
  });
});
```

## Performance Optimization

### Parallel Test Execution

```typescript
// vitest.config.ts - Parallel execution
export default defineConfig({
  test: {
    pool: 'threads', // or 'forks' for better isolation
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true,
      },
    },
    maxThreads: 4, // Adjust based on CPU cores
    minThreads: 1,
  },
});
```

### Test Chunking and Sharding

```typescript
// playwright.config.ts - Sharding for CI
export default defineConfig({
  projects: [
    {
      name: "shard-1",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: /@slow/,
      shard: { current: 1, total: 4 },
    },
    {
      name: "shard-2",
      use: { ...devices["Desktop Chrome"] },
      shard: { current: 2, total: 4 },
    },
    // ... more shards
  ],
});

// Run in CI: npx playwright test --shard=1/4
```

### Selective Test Running

```typescript
// Only run tests related to changed files
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    // Run tests for changed files only in watch mode
    changed: true,
  },
});
```

### Coverage Optimization

```typescript
// Exclude files that don't need coverage
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // Re-exports
        '**/types.ts', // Type definitions
      ],
      // Only collect coverage for source files
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      // Ignore uncovered lines in specific patterns
      ignoreCovers: [
        'console.log',
        'debugger',
      ],
    },
  },
});
```

## Best Practices Summary

### Selector Strategies
```typescript
// ❌ Bad selectors
cy.get(".btn.btn-primary.submit-button").click();
cy.get("div > form > div:nth-child(2) > input").type("text");

// ✅ Good selectors
cy.getByRole("button", { name: "Submit" }).click();
cy.getByLabel("Email address").type("user@example.com");
cy.get('[data-testid="email-input"]').type("user@example.com");
```

### Test Organization
- Use Page Objects for E2E tests
- Keep tests independent and isolated
- Use meaningful test names and descriptions
- Clean up test data after execution
- Mock external dependencies appropriately

### Performance Considerations
- Run tests in parallel when possible
- Use selective test execution in development
- Mock slow external services
- Optimize CI/CD pipelines for speed
- Monitor and fix flaky tests promptly

### Debugging Strategies
```typescript
// Playwright debugging
npx playwright test --headed  // Visual debugging
npx playwright test --debug   // Step-through debugging
await page.pause();           // Pause execution

// Cypress debugging
cy.pause();                   // Pause execution
cy.debug();                   // Debug current state

// Vitest debugging
import { describe, it } from 'vitest';
it.only('debug this test', () => { /* ... */ }); // Run single test
```

## Common Pitfalls

- **Flaky Tests**: Use proper waits, not fixed timeouts
- **Slow Tests**: Mock APIs, use parallel execution
- **Over-Testing**: Don't test every edge case with E2E
- **Coupled Tests**: Tests should not depend on each other
- **Poor Selectors**: Avoid CSS classes and nth-child
- **No Cleanup**: Clean up test data after each test
- **Testing Implementation**: Test user behavior, not internals

## Integration with CI/CD

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npx playwright test --shard=${{ matrix.shard }}/4

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Tools & Commands

| Tool | Purpose | Command |
|------|---------|---------|
| Playwright | E2E testing | `npx playwright test` |
| Cypress | E2E testing | `npx cypress run` |
| Vitest | Unit testing | `npx vitest run` |
| Coverage | Code coverage | `npx vitest run --coverage` |
| Test debugging | Debug tests | `npx playwright test --debug` |

This consolidated skill provides comprehensive patterns for automated testing across different frameworks and tools, ensuring reliable, maintainable, and performant test suites.