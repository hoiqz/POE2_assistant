# CI/CD Regression Testing Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
└─────────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
         ┌──────▼──────┐      ┌───────▼───────┐
         │   Push to   │      │  Pull Request │
         │ main/develop│      │  to main/dev  │
         └──────┬──────┘      └───────┬───────┘
                │                     │
                └──────────┬──────────┘
                           │
              ┌────────────▼──────────────┐
              │  GitHub Actions Triggered │
              └────────────┬──────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
    ┌───▼──────────────┐          ┌──────────▼────────┐
    │ E2E Regression   │          │  Smoke Tests      │
    │ Tests (Default)  │          │ (Daily + Manual)  │
    └───┬──────────────┘          └──────────┬────────┘
        │                                    │
        │ 1. Setup Node.js & deps           │ 1. Check backend health
        │ 2. Install Playwright             │ 2. Run critical tests
        │ 3. Start backend (local)          │ 3. Send Slack alert
        │ 4. Run tests (Chromium)           │ 4. Upload report
        │ 5. Upload HTML report             │
        │ 6. Comment on PR                  │
        │                                    │
        └────┬──────────────────┬───────────┘
             │                  │
        ┌────▼──┐          ┌────▼──┐
        │ PASS  │          │ FAIL  │
        └────┬──┘          └────┬──┘
             │                  │
        ✅ Green check    ❌ Workflow stops
        ✅ PR mergeable   ❌ PR blocked
        ✅ Artifacts      ❌ Screenshot captured
```

## Test Execution Flow

### E2E Regression Tests (on every commit)

```
Pull Request / Push to main/develop
           ↓
Check if paths changed (frontend/backend/tests/config)
           ↓
Setup Node.js 18
           ↓
Install Dependencies
  ├─ Root: npm install
  ├─ Frontend: cd frontend && npm install
  └─ Backend: cd backend && npm install
           ↓
Install Playwright Browsers
  └─ chromium, firefox, webkit
           ↓
Start Backend Server
  ├─ cd backend && npx tsx src/server.ts
  └─ Wait for http://localhost:3000/api/health
           ↓
Run Playwright Tests
  ├─ tests/e2e/auth.spec.ts (6 tests)
  ├─ tests/e2e/builds.spec.ts (6 tests)
  ├─ tests/e2e/chat.spec.ts (6 tests)
  └─ tests/e2e/full-flow.spec.ts (4 tests)
           ↓
Generate Reports
  ├─ HTML report
  ├─ Screenshots (failures only)
  └─ Test metrics
           ↓
Upload Artifacts
  ├─ playwright-report/ (30-day retention)
  └─ test-results/ (7-day retention)
           ↓
Comment on PR (if PR)
  └─ Link to report
           ↓
Exit with status (pass/fail)
```

### Smoke Tests (daily + manual)

```
Scheduled (Daily 2 AM UTC) OR Manual Trigger
           ↓
Setup Node.js 18
           ↓
Install Dependencies
           ↓
Install Playwright Browser (Chromium only)
           ↓
Check Backend Health
  └─ curl https://poe2assistant-production.up.railway.app/api/health
           ↓
Run Critical Tests
  └─ tests/e2e/full-flow.spec.ts
     Against: https://poe-2-assistant-ten.vercel.app
           ↓
Generate Report
           ↓
Upload Artifacts
           ↓
Send Slack Notification
  ├─ ✅ Success message (if SLACK_WEBHOOK_URL set)
  └─ ❌ Failure message with run link
           ↓
Exit with status
```

## Test Statistics

| Metric | Value |
|--------|-------|
| **Total Tests** | 22 |
| **Total Suites** | 4 |
| **Browsers Tested** | Chromium (+ Firefox, Safari on demand) |
| **E2E Regression Run Time** | ~12-15 minutes |
| **Smoke Tests Run Time** | ~5-7 minutes |
| **Average Test Time** | 30-90 seconds |

### Test Coverage by Area

| Area | Tests | Coverage |
|------|-------|----------|
| **Authentication** | 6 | Signup, Login, Logout, Validation |
| **Build Management** | 6 | Import, Delete, List, Navigate |
| **Chat Feature** | 6 | Message send, Modal, Navigation |
| **End-to-End Flows** | 4 | Complete journeys + Edge cases |

## Artifacts & Reports

### Test Report Structure

```
playwright-report/
├── index.html              ← Open this in browser
├── data/
│   └── [test-data].json
├── blob/
│   └── [screenshots].png
└── test-results/
    ├── auth-*.png          ← Failed auth tests
    ├── builds-*.png        ← Failed build tests
    ├── chat-*.png          ← Failed chat tests
    └── full-flow-*.png     ← Failed flow tests
```

### View Reports

**In GitHub:**
1. Actions → Workflow Run → Artifacts
2. Download `playwright-report`
3. Extract and open `index.html`

**Or direct link:**
- Click test name → "Artifacts" → `playwright-report`

## Environment Variables

### Automatically Set in CI

| Variable | Value | Source |
|----------|-------|--------|
| `NODE_VERSION` | 18 | Workflow env |
| `ANTHROPIC_API_KEY` | ••••• | GitHub Secret |
| `BASE_URL` | http://localhost:5173 | playwright.config.ts |

### For Smoke Tests

| Variable | Value |
|----------|-------|
| `BASE_URL` | https://poe-2-assistant-ten.vercel.app |
| `FRONTEND_URL` | https://poe-2-assistant-ten.vercel.app |
| `BACKEND_URL` | https://poe2assistant-production.up.railway.app |

## Failure Scenarios

### Test Failures

**If any test fails:**
- ❌ Workflow stops
- ❌ Artifacts uploaded (with screenshots)
- ❌ PR marked as failed
- ❌ PR cannot be merged until fixed

**How to debug:**
1. Click workflow run in Actions
2. See error in "Run Playwright tests" step
3. Download screenshot from artifacts
4. Reproduce locally: `npm run test:e2e:headed`

### Backend Start Failures

**If backend won't start:**
- ❌ Workflow stops
- ⚠️ Check ANTHROPIC_API_KEY is set
- ⚠️ Check no syntax errors in backend
- ⚠️ Check port 3000 is available

### Other Failures

| Issue | Fix |
|-------|-----|
| Dependencies fail | Clear cache, rebuild |
| Playwright install fails | Increase timeout |
| Tests timeout | Increase timeout in playwright.config.ts |
| Network errors | Check connectivity |

## Customization

### Enable All Browsers

File: `.github/workflows/e2e-tests.yml`
```yaml
# Change this:
run: npm run test:e2e -- --project chromium

# To this:
run: npm run test:e2e
```

### Change Test Timeout

File: `playwright.config.ts`
```typescript
// Default: 30 seconds
timeout: 60000,  // Change to 60 seconds
```

### Add New Test File

Create `.github/workflows/e2e-tests.yml` and it will be auto-discovered:
```bash
touch tests/e2e/newfeature.spec.ts
```

### Disable CI for a Commit

```bash
git commit -m "WIP: [skip ci]"
```

## Monitoring & Alerts

### Check Test Status

**Quick check:**
- Go to repository → Click green ✅ or red ❌ on latest commit

**Detailed view:**
- Actions tab → Select workflow → View run

### Get Notified

**GitHub Notifications:**
- Built-in (default)
- Emails on PR failures
- Mobile app notifications

**Slack (optional):**
- Set `SLACK_WEBHOOK_URL` secret
- Get real-time notifications
- Automatic success/failure messages

### Schedule Smoke Tests

Edit `.github/workflows/smoke-tests.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Default: daily at 2 AM UTC
```

Cron examples:
- `'0 9 * * 1-5'` = Weekdays at 9 AM
- `'0 */4 * * *'` = Every 4 hours
- `'0 0 * * 0'` = Weekly on Sunday

## Performance Metrics

### Typical Run Times (Ubuntu-latest)

| Step | Time |
|------|------|
| Setup Node.js | 10s |
| Install deps | 60s |
| Install Playwright | 120s |
| Start backend | 5s |
| Run tests | 480s (8 min) |
| Upload artifacts | 30s |
| **Total** | **~12-15 min** |

### Optimization Tips

- Use caching (configured)
- Run only Chromium (vs all 3 browsers) ✅
- Parallelize test files (if needed)
- Use `--forbidOnly` to catch `.only` in tests

## Next Steps

1. ✅ Workflows configured
2. ⚙️ [Set up GitHub Secrets](.github/CICD_QUICK_START.md)
3. 🧪 Create test PR to verify
4. 📊 Check Actions tab for results
5. 📈 Monitor regression trends over time
