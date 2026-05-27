# CI/CD Setup Checklist

Complete these steps to enable automated regression testing:

## ☑️ Prerequisites
- [ ] Repository is on GitHub
- [ ] GitHub Actions is enabled (default for public/private repos)
- [ ] Node.js 18+ installed locally for testing

## ☑️ Step 1: Set Up GitHub Secrets (Required)

### Anthropic API Key (Required for tests)
1. [ ] Go to GitHub Repo → Settings
2. [ ] Navigate to Secrets and variables → Actions
3. [ ] Click "New repository secret"
4. [ ] Name: `ANTHROPIC_API_KEY`
5. [ ] Value: Your API key from https://console.anthropic.com/
6. [ ] Click "Add secret"

### Slack Webhook (Optional - for notifications)
1. [ ] Go to https://api.slack.com/apps
2. [ ] Click "Create New App" → "From scratch"
3. [ ] App name: "POE2 Tests"
4. [ ] Select your workspace
5. [ ] Go to "Incoming Webhooks" → Enable it
6. [ ] Click "Add New Webhook to Workspace"
7. [ ] Select your channel
8. [ ] Copy the webhook URL
9. [ ] Go to GitHub Secrets
10. [ ] Add new secret: `SLACK_WEBHOOK_URL` with webhook URL

## ☑️ Step 2: Verify Workflow Files

The following files should exist:
- [ ] `.github/workflows/e2e-tests.yml` (E2E regression tests)
- [ ] `.github/workflows/smoke-tests.yml` (Production smoke tests)
- [ ] `.github/CI_CD_SETUP.md` (Detailed guide)
- [ ] `.github/CICD_QUICK_START.md` (Quick reference)
- [ ] `tests/CI_CD_OVERVIEW.md` (Architecture overview)
- [ ] `tests/README.md` (Test documentation)
- [ ] `playwright.config.ts` (Playwright configuration)

## ☑️ Step 3: Test the Setup

### Option A: Create a Test PR
```bash
# Create a test branch
git checkout -b test/ci-setup

# Create empty commit
git commit --allow-empty -m "Test CI/CD setup"

# Push branch
git push origin test/ci-setup

# Create PR on GitHub and watch Actions tab
```

### Option B: Run Smoke Tests Manually
1. [ ] Go to GitHub Actions tab
2. [ ] Click "Smoke Tests (Production)"
3. [ ] Click "Run workflow"
4. [ ] Select `main` branch
5. [ ] Click "Run workflow"
6. [ ] Watch the test run

## ☑️ Step 4: Verify Test Run

After running tests (either via PR or manual trigger):

1. [ ] Check Actions tab shows workflow running
2. [ ] Wait for workflow to complete (~15 minutes for E2E)
3. [ ] Verify status is green ✅ or red ❌
4. [ ] Click workflow run to see details
5. [ ] Download `playwright-report` artifact
6. [ ] Extract and open `playwright-report/index.html` in browser
7. [ ] Verify all 22 tests passed or see failure details

## ☑️ Step 5: Configure Notifications (Optional)

### Email Notifications
1. [ ] GitHub Settings → Notifications
2. [ ] Check "Email notifications on push"
3. [ ] You'll get emails on test failures

### Slack Notifications
1. [ ] Verify `SLACK_WEBHOOK_URL` secret is set
2. [ ] Smoke tests will send Slack messages automatically
3. [ ] E2E tests can be configured similarly (optional)

## ☑️ Step 6: Customize for Your Setup

### If Using Different URLs
Edit `.github/workflows/smoke-tests.yml`:
```yaml
env:
  FRONTEND_URL: your-frontend-url
  BACKEND_URL: your-backend-url
```

### If Using Different Schedule
Edit `.github/workflows/smoke-tests.yml`:
```yaml
schedule:
  - cron: '0 9 * * 1-5'  # Your preferred time
```

### If Testing All Browsers
Edit `.github/workflows/e2e-tests.yml`:
```yaml
run: npm run test:e2e  # Instead of --project chromium
```

## ☑️ Step 7: Document for Team

Share with your team:
1. [ ] `.github/CICD_QUICK_START.md` - How to run tests
2. [ ] `.github/CI_CD_SETUP.md` - Full documentation
3. [ ] `tests/CI_CD_OVERVIEW.md` - Architecture overview

## ✅ You're Done!

Your regression testing is now set up! Here's what happens:

✅ **Every push to main/develop:**
- E2E tests run automatically
- 22 tests in ~12-15 minutes
- PR shows green ✅ or red ❌
- Artifacts uploaded if needed

✅ **Every day at 2 AM UTC:**
- Smoke tests run against production
- Slack notification sent (if configured)
- Report uploaded to artifacts

✅ **On demand:**
- Run "Smoke Tests" workflow manually anytime
- Useful for verifying after hotfix/deployment

## 📚 Additional Resources

| Document | Purpose |
|----------|---------|
| `.github/CICD_QUICK_START.md` | Quick reference (5 min setup) |
| `.github/CI_CD_SETUP.md` | Detailed guide with troubleshooting |
| `tests/CI_CD_OVERVIEW.md` | Architecture & flow diagrams |
| `tests/README.md` | How to run tests locally |

## 🚀 Next Steps

1. **Monitor the first week:** Check that tests run smoothly
2. **Review test reports:** Understand test coverage and gaps
3. **Adjust schedule:** Move smoke tests to your preferred time
4. **Add team access:** Share documentation with team
5. **Create rollout plan:** Communicate to team about CI/CD gates

## ❓ Troubleshooting

**Tests won't start?**
→ See `.github/CI_CD_SETUP.md` → Troubleshooting section

**Backend health check fails?**
→ Check `ANTHROPIC_API_KEY` is set correctly

**Slack notifications not working?**
→ Verify `SLACK_WEBHOOK_URL` is correct

**Want different test timing?**
→ Edit cron schedule in smoke-tests.yml

## 📞 Questions?

See documentation files for detailed answers:
- Technical details → `CI_CD_SETUP.md`
- Quick answers → `CICD_QUICK_START.md`
- How it works → `tests/CI_CD_OVERVIEW.md`
