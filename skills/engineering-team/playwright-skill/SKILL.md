---
name: playwright-skill
description: Complete browser automation with Playwright. Prefer Page Object Model (POM) for reusable flows and test suites; auto-detects dev servers, writes scripts to /tmp. Test pages, fill forms, screenshots, responsive design, login flows, link checks. Use when testing websites, automating browser interactions, building E2E test suites, or reusing page interactions across tests.
---

**IMPORTANT - Path Resolution:**
This skill can be installed in different locations (plugin system, manual installation, global, or project-specific). Before executing any commands, determine the skill directory based on where you loaded this SKILL.md file, and use that path in all commands below. Replace `$SKILL_DIR` with the actual discovered path.

Common installation paths:

- Manual global: `~/.{cursor,claude,codex}/skills/engineering-team/playwright-skill`
- Project-specific: `<project>/.{cursor,claude,codex}/skills/engineering-team/playwright-skill`

# Playwright Browser Automation

General-purpose browser automation skill. Write custom Playwright code for any automation task and execute it via the universal executor.

**Reuse and structure:** For any flow or suite that will be reused or maintained, use the **Page Object Model (POM)**. Centralize locators and actions in page/component classes; keep assertions in tests. See [references/page-object-models.md](references/page-object-models.md) for the full guide. For one-off scripts (single screenshot, quick check), inline code is fine.

**CRITICAL WORKFLOW - Follow these steps in order:**

1. **Auto-detect dev servers** - For localhost testing, ALWAYS run server detection FIRST:
   ```bash
   cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(servers => console.log(JSON.stringify(servers)))"
   ```
   - If **1 server found**: Use it automatically, inform user
   - If **multiple servers found**: Ask user which one to test
   - If **no servers found**: Ask for URL or offer to help start dev server

2. **Write scripts to /tmp** - NEVER write test files to skill directory; always use `/tmp/playwright-test-*.js`

3. **Use visible browser by default** - Always use `headless: false` unless user specifically requests headless mode

4. **Parameterize URLs** - Always make URLs configurable via environment variable or constant at top of script

## How It Works

1. You describe what you want to test/automate
2. I auto-detect running dev servers (or ask for URL if testing external site)
3. I write custom Playwright code in `/tmp/playwright-test-*.js` (won't clutter your project)
4. I execute it via: `cd $SKILL_DIR && node run.js /tmp/playwright-test-*.js`
5. Results displayed in real-time, browser window visible for debugging
6. Test files auto-cleaned from /tmp by your OS

## Setup (First Time)

```bash
cd $SKILL_DIR
pnpm run setup
```

This installs Playwright and Chromium browser. Only needed once.

## Execution Pattern

**Step 1: Detect dev servers (for localhost testing)**

```bash
cd $SKILL_DIR && node -e "require('./lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
```

**Step 2: Write test script to /tmp with URL parameter**

```javascript
// /tmp/playwright-test-page.js
const { chromium } = require('playwright');

// Parameterized URL (detected or user-provided)
const TARGET_URL = 'http://localhost:3001'; // <-- Auto-detected or from user

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(TARGET_URL);
  console.log('Page loaded:', await page.title());

  await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });
  console.log('📸 Screenshot saved to /tmp/screenshot.png');

  await browser.close();
})();
```

**Step 3: Execute from skill directory**

```bash
cd $SKILL_DIR && node run.js /tmp/playwright-test-page.js
```

## Page Object Model (POM)

**When to use POM:** Multiple tests for the same pages, reusable flows (e.g. login), or any suite you plan to maintain. One UI change then updates one page object instead of many test files.

**Rules:**

- One page or major section = one class (constructor receives `page`).
- Locators as readonly class properties; use resilient selectors: `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`, `getByTestId()` over raw CSS when possible.
- Methods perform actions (e.g. `goto()`, `login()`); do **not** put assertions inside page objects—tests call `expect()`.
- Optional: base page for shared behavior; component classes for shared UI (nav, modals).

**Full guide and examples:** [references/page-object-models.md](references/page-object-models.md). Official docs: [Playwright – Page object models](https://playwright.dev/docs/pom).

## Common Patterns

### Test a Page (Multiple Viewports)

```javascript
// /tmp/playwright-test-responsive.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  // Desktop test
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(TARGET_URL);
  console.log('Desktop - Title:', await page.title());
  await page.screenshot({ path: '/tmp/desktop.png', fullPage: true });

  // Mobile test
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: '/tmp/mobile.png', fullPage: true });

  await browser.close();
})();
```

### Test Login Flow

For one-off runs, inline is fine. For reuse or multiple tests, use a page object (see [references/page-object-models.md](references/page-object-models.md)).

**Inline (one-off):**

```javascript
// /tmp/playwright-test-login.js
const { chromium } = require('playwright');
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`${TARGET_URL}/login`);
  await page.getByLabel(/email|username/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('password123');
  await page.getByRole('button', { name: /log in|sign in|submit/i }).click();
  await page.waitForURL('**/dashboard');
  console.log('✅ Login successful, redirected to dashboard');
  await browser.close();
})();
```

**With POM (reusable):** Define a `LoginPage` class with locators and `login(username, password)`; instantiate in script and call `await loginPage.login(...)`. Assertions stay in the script (e.g. `expect(page).toHaveURL(/dashboard/)`).

### Fill and Submit Form

Use resilient locators (`getByLabel`, `getByRole`). For forms reused across tests, put them in a page object (e.g. `ContactPage`) with locators and a `submitForm({ name, email, message })` method.

```javascript
// /tmp/playwright-test-form.js
const { chromium } = require('playwright');
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3001';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  await page.goto(`${TARGET_URL}/contact`);
  await page.getByLabel(/name/i).fill('John Doe');
  await page.getByLabel(/email/i).fill('john@example.com');
  await page.getByLabel(/message/i).fill('Test message');
  await page.getByRole('button', { name: /submit|send/i }).click();
  await page.getByText(/success|thank you/i).waitFor({ state: 'visible' });
  console.log('✅ Form submitted successfully');
  await browser.close();
})();
```

### Check for Broken Links

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');

  const links = await page.locator('a[href^="http"]').all();
  const results = { working: 0, broken: [] };

  for (const link of links) {
    const href = await link.getAttribute('href');
    try {
      const response = await page.request.head(href);
      if (response.ok()) {
        results.working++;
      } else {
        results.broken.push({ url: href, status: response.status() });
      }
    } catch (e) {
      results.broken.push({ url: href, error: e.message });
    }
  }

  console.log(`✅ Working links: ${results.working}`);
  console.log(`❌ Broken links:`, results.broken);

  await browser.close();
})();
```

### Take Screenshot with Error Handling

```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle',
      timeout: 10000
    });

    await page.screenshot({
      path: '/tmp/screenshot.png',
      fullPage: true
    });

    console.log('📸 Screenshot saved to /tmp/screenshot.png');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
```

### Test Responsive Design

```javascript
// /tmp/playwright-test-responsive-full.js
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:3001'; // Auto-detected

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];

  for (const viewport of viewports) {
    console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height
    });

    await page.goto(TARGET_URL);
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: `/tmp/${viewport.name.toLowerCase()}.png`,
      fullPage: true
    });
  }

  console.log('✅ All viewports tested');
  await browser.close();
})();
```

## Inline Execution (Simple Tasks)

For quick one-off tasks, you can execute code inline without creating files:

```bash
# Take a quick screenshot
cd $SKILL_DIR && node run.js "
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('http://localhost:3001');
await page.screenshot({ path: '/tmp/quick-screenshot.png', fullPage: true });
console.log('Screenshot saved');
await browser.close();
"
```

**When to use inline vs files:**
- **Inline**: Quick one-off tasks (screenshot, check if element exists, get page title)
- **Files**: Complex tests, responsive design checks, anything user might want to re-run

## Available Helpers

Optional utility functions in `lib/helpers.js`:

```javascript
const helpers = require('./lib/helpers');

// Detect running dev servers (CRITICAL - use this first!)
const servers = await helpers.detectDevServers();
console.log('Found servers:', servers);

// Safe click with retry
await helpers.safeClick(page, 'button.submit', { retries: 3 });

// Safe type with clear
await helpers.safeType(page, '#username', 'testuser');

// Take timestamped screenshot
await helpers.takeScreenshot(page, 'test-result');

// Handle cookie banners
await helpers.handleCookieBanner(page);

// Extract table data
const data = await helpers.extractTableData(page, 'table.results');
```

See `lib/helpers.js` for full list.

## Advanced Usage

- **POM and reuse:** [references/page-object-models.md](references/page-object-models.md) – structure, base page, components, when to use POM.
- **Playwright API:** [Playwright Docs](https://playwright.dev/docs/intro) – locators, network mocking, auth, visual regression, emulation, debugging, CI/CD.
- **Locators:** [Playwright Locators](https://playwright.dev/docs/locators) – getByRole, getByLabel, and resilient selector strategy.

## Tips

- **CRITICAL: Detect servers FIRST** – Run `detectDevServers()` before writing test code for localhost.
- **Use /tmp for test files** – Write to `/tmp/playwright-test-*.js`, not the skill directory or user project.
- **Parameterize URLs** – Use `TARGET_URL` (or `BASE_URL`) at the top of every script.
- **Reuse: Prefer POM** – For flows or suites used in more than one place, use page objects; see [references/page-object-models.md](references/page-object-models.md).
- **Resilient locators** – Prefer `getByRole()`, `getByLabel()`, `getByText()` over raw CSS; use `getByTestId()` only when needed.
- **DEFAULT: Visible browser** – Use `headless: false` unless the user asks for headless.
- **Slow down:** Use `slowMo: 100` for visibility when debugging.
- **Wait strategies:** Use `waitForURL`, `waitForSelector`, `waitForLoadState` instead of fixed timeouts.
- **Error handling:** Use try-catch for robust automation; use `console.log()` to show progress.

## Troubleshooting

**Playwright not installed:**
```bash
cd $SKILL_DIR && pnpm run setup
```

**Module not found:**
Ensure running from skill directory via `run.js` wrapper

**Browser doesn't open:**
Check `headless: false` and ensure display available

**Element not found:**
Add wait: `await page.waitForSelector('.element')`

## Example Usage

```
User: "Test if the marketing page looks good"

Claude: I'll test the marketing page across multiple viewports. Let me first detect running servers...
[Runs: detectDevServers()]
[Output: Found server on port 3001]
I found your dev server running on http://localhost:3001

[Writes custom automation script to /tmp/playwright-test-marketing.js with URL parameterized]
[Runs: cd $SKILL_DIR && node run.js /tmp/playwright-test-marketing.js]
[Shows results with screenshots from /tmp/]
```

```
User: "Check if login redirects correctly"

Claude: I'll test the login flow. First, let me check for running servers...
[Runs: detectDevServers()]
[Output: Found servers on ports 3000 and 3001]
I found 2 dev servers. Which one should I test?
- http://localhost:3000
- http://localhost:3001

User: "Use 3001"

[Writes login automation to /tmp/playwright-test-login.js]
[Runs: cd $SKILL_DIR && node run.js /tmp/playwright-test-login.js]
[Reports: ✅ Login successful, redirected to /dashboard]
```

## Consolidated References

This skill consolidates the following sub-topics as reference documents:

- **Test Architecture** — `references/test-architecture.md` — Test project/suite organization, configuration, and execution setup
- **Page Object Model** — `references/page-object-model.md` — POM patterns for maintainable and reusable test code
- **Fixtures and Hooks** — `references/fixtures-and-hooks.md` — Test state/infrastructure management with Playwright fixtures
- **BDD Configuration** — `references/bdd-configuration.md` — Playwright BDD project configuration with Cucumber integration
- **BDD Gherkin Syntax** — `references/bdd-gherkin-syntax.md` — Gherkin feature files and scenario structure for BDD tests

Load these references on-demand when working in the specific sub-topic area.

## Notes

- Automation is custom-written per request; any browser task is supported.
- For reuse and maintainability, use **Page Object Model** – see [references/page-object-models.md](references/page-object-models.md).
- Auto-detect dev servers first; write scripts to `/tmp`; run via `run.js`.
- Progressive disclosure: POM details and examples live in `references/`; load when structuring suites or reusing flows.
