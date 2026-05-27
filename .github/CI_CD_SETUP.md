# CI/CD Setup Guide

This document explains how to set up and configure the Playwright regression tests in GitHub Actions CI/CD.

## Overview

Two workflows are configured:

1. **E2E Regression Tests** (`e2e-tests.yml`) - Runs on every push/PR to detect regressions
2. **Smoke Tests** (`smoke-tests.yml`) - Runs daily against production deployment

## Workflow 1: E2E Regression Tests

### When it Runs

- ✅ Every push to `main` or `develop` branches
- ✅ Every pull request to `main` or `develop` branches
- ✅ Only when specific paths change (frontend, backend, tests, config)

### What it Does

1. **Sets up environment**
   - Installs Node.js 18
   - Installs dependencies (frontend, backend, root)
   - Installs Playwright browsers

2. **Starts services**
   - Starts backend server locally on `http://localhost:3000`
   - Waits for backend health check to pass
   - Starts frontend dev server on `http://localhost:5173` (auto-started by Playwright config)

3. **Runs tests**
   - Executes all Playwright tests in Chromium browser
   - Generates HTML report
   - Captures screenshots on failures

4. **Reports results**
   - Uploads HTML report as artifact (30-day retention)
   - Uploads test results as artifact (7-day retention)
   - Comments on PR with results link

### Configuration

**No additional setup required!** The workflow automatically:
- Detects Playwright tests in `tests/e2e/`
- Starts the dev server (configured in `playwright.config.ts`)
- Runs tests against local environment

## Workflow 2: Smoke Tests (Production)

### When it Runs

- ✅ Manually via GitHub Actions "Run workflow" button
- ✅ Daily at 2 AM UTC (configurable via cron)
- ✅ Only on main branch after deployment

### What it Does

1. **Checks backend health**
   - Verifies production backend is responding
   - Fails immediately if backend is down

2. **Runs critical tests**
   - Executes full-flow tests against production URLs
   - Tests the happy path: signup → import → chat → variants

3. **Sends notifications**
   - Slack notification on success
   - Slack notification on failure with run link
   - Reports uploaded to artifacts

### Required Secrets

Add these GitHub Secrets (Settings → Secrets → Actions):

```
ANTHROPIC_API_KEY     - Your Anthropic API key (for Claude integration)
SLACK_WEBHOOK_URL     - Optional: Slack webhook for notifications
```

### Configuration

Edit these variables in `.github/workflows/smoke-tests.yml`:

```yaml
env:
  FRONTEND_URL: https://poe-2-assistant-ten.vercel.app
  BACKEND_URL: https://poe2assistant-production.up.railway.app
```

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret" for each:

### Required Secrets

#### `ANTHROPIC_API_KEY`
- **Value**: Your Anthropic API key
- **Used by**: E2E tests (Claude integration)
- **How to get**: https://console.anthropic.com/

### Optional Secrets

#### `SLACK_WEBHOOK_URL`
- **Value**: Your Slack webhook URL
- **Used by**: Smoke tests notifications
- **How to set up**:
  1. Go to https://api.slack.com/apps
  2. Create new app (From scratch)
  3. Enable "Incoming Webhooks"
  4. Add webhook to your Slack channel
  5. Copy webhook URL to GitHub Secrets

## Test Reports

### Local Machine

After tests run, view reports:

```bash
# View HTML report
npx playwright show-report

# Or open directly
open playwright-report/index.html
```

### GitHub Actions

1. Go to Actions tab → select workflow run
2. Scroll to "Artifacts" section
3. Download `playwright-report` to view locally

## Customizing Tests

### Add/Remove Test Files

Tests are in `tests/e2e/`:
- `auth.spec.ts` - Authentication tests
- `builds.spec.ts` - Build management
- `chat.spec.ts` - Chat functionality
- `full-flow.spec.ts` - End-to-end flows

Modify or add `.spec.ts` files - they're automatically discovered.

### Change Browser Coverage

Default is Chromium (fast, reliable). To add Firefox/Safari:

**For E2E Regression Tests:**
In `.github/workflows/e2e-tests.yml`, change:
```yaml
run: npm run test:e2e -- --project chromium
```
to:
```yaml
run: npm run test:e2e  # Runs all browsers: chromium, firefox, webkit
```

**Performance note**: Running all 3 browsers increases CI time by ~3x.

### Change Test Timeout

Default: 30 seconds per test. Increase for flaky tests:

In `playwright.config.ts`:
```typescript
timeout: 60000  // 60 seconds
```

## Monitoring & Alerts

### Manual Trigger

Run smoke tests immediately:
1. GitHub → Actions → "Smoke Tests (Production)"
2. Click "Run workflow"
3. Select `main` branch
4. Click "Run workflow"

### Scheduled Checks

Smoke tests run daily at 2 AM UTC. Change schedule in `smoke-tests.yml`:

```yaml
schedule:
  - cron: '0 2 * * *'  # At 02:00 UTC every day
  # Examples:
  # '0 9 * * 1-5'     # Weekdays at 9 AM
  # '0 */4 * * *'     # Every 4 hours
```

### GitHub Status Checks

The E2E test workflow is a required status check. PRs cannot be merged if tests fail.

## Debugging Failed Tests

### On GitHub Actions

1. Click "E2E Regression Tests" workflow
2. Click the failed test run
3. Expand "Run Playwright tests" step
4. View error message and stack trace
5. Download screenshot from artifacts

### Common Issues

**Backend failed to start**
- Check backend has no syntax errors
- Verify port 3000 is available
- Check ANTHROPIC_API_KEY is set

**Tests timeout**
- Increase `timeout` in playwright.config.ts
- Check if frontend dev server started properly
- Verify network connectivity

**Different behavior than local**
- CI runs on Ubuntu (not macOS/Windows)
- Differences in timing/network speed
- Use `--headed` locally to debug: `npm run test:e2e:headed`

## Performance

Expected run times:
- **E2E Regression**: 12-15 minutes
- **Smoke Tests**: 5-7 minutes

Bottlenecks:
- Installing dependencies (~2 min)
- Installing Playwright browsers (~2 min)
- Running tests (~8 min)

## Next Steps

1. ✅ Workflows are ready to use
2. ⚙️ Set `ANTHROPIC_API_KEY` secret
3. 🧪 Create a test PR to verify workflow runs
4. 📊 Monitor test results in Actions tab
5. (Optional) Set up Slack notifications with webhook

## Troubleshooting

**Tests won't start:**
- Check Node.js version is 18+
- Verify `playwright.config.ts` exists
- Ensure `tests/e2e/` directory exists

**Backend health check fails:**
- Verify backend starts: `cd backend && npx tsx src/server.ts`
- Check logs in workflow output
- Verify database is accessible

**Tests pass locally but fail in CI:**
- Timing issues: increase timeouts
- Network issues: check firewall/proxy
- Environment differences: verify env vars match

**Want to skip CI for some commits:**
```bash
git commit -m "Fix typo [skip ci]"
```
