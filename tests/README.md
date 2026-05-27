# Playwright E2E Tests

Comprehensive end-to-end tests for the POE 2 Build Companion application using Playwright.

## Setup

Playwright is already installed as a dev dependency. The tests are configured in `playwright.config.ts` at the project root.

## Test Files

- **auth.spec.ts** - Authentication flows (signup, login, logout, password validation)
- **builds.spec.ts** - Build management (import, list, delete, navigate to chat/variants)
- **chat.spec.ts** - Chat functionality (message sending, variant saving, export)
- **full-flow.spec.ts** - Complete end-to-end user journey and edge cases

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI
```bash
npm run test:e2e:ui
```

### Debug specific test
```bash
npm run test:e2e:debug
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run specific test
```bash
npx playwright test -g "should create account and redirect to dashboard"
```

## Test Configuration

- **Base URL**: http://localhost:5173 (dev server) - set via `BASE_URL` env var
- **Browsers**: Chromium, Firefox, WebKit (all three run by default)
- **Timeout**: 30 seconds per test
- **Retries**: 0 for local, 2 for CI
- **Reporters**: HTML report in `playwright-report/`
- **Screenshots**: Captured on failure
- **Traces**: Recorded on first retry

## Development Workflow

1. Start the frontend dev server in one terminal:
   ```bash
   cd frontend && npm run dev
   ```

2. Run tests in another terminal:
   ```bash
   npm run test:e2e
   ```

3. View test report:
   ```bash
   npx playwright show-report
   ```

## Test Coverage

- ✅ User authentication (signup, login, logout)
- ✅ Password validation and error handling
- ✅ Build management (import, list, delete)
- ✅ JSON validation on import
- ✅ Chat interface and messaging
- ✅ Build variants (save, view)
- ✅ Conversation export
- ✅ Route protection
- ✅ Navigation flows
- ✅ Error handling
- ✅ Responsive design verification

## Key Test Patterns

### Authentication Setup
Tests use dynamic email addresses (timestamp-based) to avoid conflicts:
```typescript
const email = `test-${Date.now()}@example.com`;
```

### Async Waits
Tests properly wait for navigation and network responses:
```typescript
await page.waitForURL(/.*builds/);
await expect(page.locator('text=Your Builds')).toBeVisible();
```

### Build Creation Helper
Common setup function used across tests:
```typescript
async function loginUser(page, email, password) {
  // Create account and navigate to builds
}
```

## Debugging Tips

- Use `--debug` flag to step through tests
- Check `playwright-report/` for HTML report after runs
- Use `test.only()` to run single test
- Add `await page.pause()` to pause execution at specific points
- Check screenshots in report for visual debugging

## CI/CD Integration

For GitHub Actions or other CI:
```bash
BASE_URL=https://your-deployed-url npm run test:e2e
```

The config automatically runs with `reuseExistingServer: false` in CI.
